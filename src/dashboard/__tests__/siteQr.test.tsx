import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ApiError } from "../../api/http";
import type { AccountSite, SiteDetail } from "../api/types";
import { pendingDomain, qrFilename, qrPaidBlock } from "../qr";

/**
 * The printable QR card.
 *
 * Four things are asserted, chosen because each is a wrong answer that would
 * not announce itself:
 *
 * - a free site must issue **no request at all**, so nobody learns about the
 *   gate from a spinner followed by a refusal;
 * - the preview's object URL must be revoked, or every visit to this screen
 *   leaks a decoded image for the life of the tab;
 * - the PDF button must actually ask for a PDF, since both buttons look alike
 *   and a PNG saved under a `.pdf` name opens as a broken file;
 * - the three subscription refusals must stay three, because collapsing them
 *   tells a client who has already paid that they should upgrade.
 */

const fetchSiteQr = vi.fn();
const fetchSiteDetail = vi.fn();
const handleError = vi.fn();

let site: AccountSite;
let isOwner = true;

vi.mock("../api/client", () => ({
  fetchSiteQr: (...args: unknown[]) => fetchSiteQr(...args),
  fetchSiteDetail: (...args: unknown[]) => fetchSiteDetail(...args),
}));

vi.mock("../auth", () => ({
  useSession: () => ({ token: "tok", handleError }),
  useAuth: () => ({ handleError }),
}));

vi.mock("../site", () => ({
  useActiveSite: () => site,
  useIsOwner: () => isOwner,
}));

vi.mock("../../i18n", () => ({
  useI18n: () => ({ locale: "en" }),
}));

const { default: SiteQr } = await import("../pages/SiteQr");

function accountSite(over: Partial<AccountSite> = {}): AccountSite {
  return {
    id: "site-1",
    slug: "marita",
    businessName: "Marita",
    status: "PUBLISHED",
    role: "SITE_OWNER",
    defaultLanguage: "ka",
    subscription: { status: "ACTIVE", allowsPaidFeatures: true },
    ...over,
  } as AccountSite;
}

function detail(over: Partial<SiteDetail> = {}): SiteDetail {
  return { id: "site-1", slug: "marita", ...over } as SiteDetail;
}

function show() {
  return render(
    <MemoryRouter>
      <SiteQr />
    </MemoryRouter>,
  );
}

let created: string[] = [];
let revoked: string[] = [];
let saved: { name: string; href: string }[] = [];

beforeEach(() => {
  created = [];
  revoked = [];
  saved = [];
  let next = 0;
  site = accountSite();
  isOwner = true;
  fetchSiteQr.mockReset();
  fetchSiteDetail.mockReset();
  handleError.mockReset();
  fetchSiteDetail.mockResolvedValue(detail());
  fetchSiteQr.mockResolvedValue({ blob: new Blob(["png"]) });
  globalThis.URL.createObjectURL = vi.fn(() => {
    const url = `blob:qr-${(next += 1)}`;
    created.push(url);
    return url;
  });
  globalThis.URL.revokeObjectURL = vi.fn((url: string) => {
    revoked.push(url);
  });
  // jsdom implements no downloads, so a real click on the save anchor only
  // produces a "navigation to another Document" complaint. Recording the
  // attributes is what the assertions are about anyway.
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
    function (this: HTMLAnchorElement) {
      saved.push({ name: this.download, href: this.href });
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the QR card screen", () => {
  it("offers a free site the plan instead of a failed download", async () => {
    site = accountSite({
      subscription: { status: "NONE", allowsPaidFeatures: false },
    } as Partial<AccountSite>);

    show();

    expect(await screen.findByTestId("qr-locked-FREE_PLAN")).toBeInTheDocument();
    // The whole point: nothing is asked of an endpoint that would refuse.
    expect(fetchSiteQr).not.toHaveBeenCalled();
  });

  it("tells a lapsed client their site is still theirs, not to upgrade", async () => {
    site = accountSite({
      subscription: { status: "EXPIRED", allowsPaidFeatures: false },
    } as Partial<AccountSite>);

    show();

    expect(await screen.findByTestId("qr-locked-LAPSED")).toBeInTheDocument();
    expect(screen.queryByTestId("qr-locked-FREE_PLAN")).not.toBeInTheDocument();
    expect(fetchSiteQr).not.toHaveBeenCalled();
  });

  it("keeps the billing link away from an editor, but not the explanation", async () => {
    isOwner = false;
    site = accountSite({
      role: "SITE_EDITOR",
      subscription: { status: "NONE", allowsPaidFeatures: false },
    } as Partial<AccountSite>);

    show();

    expect(await screen.findByTestId("qr-locked-FREE_PLAN")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("previews the card and omits lang until the client asks for one", async () => {
    show();

    await waitFor(() => expect(fetchSiteQr).toHaveBeenCalled());
    expect(fetchSiteQr).toHaveBeenCalledWith("tok", "site-1", "png", undefined);
    const image = await screen.findByRole("img");
    expect(image).toHaveAttribute("src", created[0]);
  });

  it("revokes the preview's object URL when the screen goes away", async () => {
    const view = show();
    await screen.findByRole("img");
    expect(created).toHaveLength(1);
    expect(revoked).toHaveLength(0);

    view.unmount();

    expect(revoked).toEqual(created);
  });

  it("revokes the previous preview when the card language changes", async () => {
    show();
    await screen.findByRole("img");

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    await waitFor(() => expect(created).toHaveLength(2));
    expect(fetchSiteQr).toHaveBeenLastCalledWith("tok", "site-1", "png", "en");
    // The first one is gone before the second is shown.
    expect(revoked).toEqual([created[0]]);
  });

  it("asks for a PDF when the printing button is used", async () => {
    show();
    await screen.findByRole("img");
    fetchSiteQr.mockResolvedValueOnce({ blob: new Blob(["pdf"]) });

    fireEvent.click(
      screen.getByRole("button", { name: /Download for printing/ }),
    );

    await waitFor(() =>
      expect(fetchSiteQr).toHaveBeenLastCalledWith(
        "tok",
        "site-1",
        "pdf",
        undefined,
      ),
    );
    // Derived from the slug, because the server's own `Content-Disposition` is
    // invisible to a cross-origin fetch unless it is explicitly exposed.
    await waitFor(() => expect(saved).toHaveLength(1));
    expect(saved[0].name).toBe("marita-qr.pdf");
  });

  it("saves the PNG from the bytes it already has", async () => {
    show();
    await screen.findByRole("img");
    expect(fetchSiteQr).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /as an image/ }));
    await waitFor(() => expect(saved).toHaveLength(1));

    // No second request: the preview and the download are the same bytes.
    expect(fetchSiteQr).toHaveBeenCalledTimes(1);
    expect(saved[0].name).toBe("marita-qr.png");
  });

  it("locks the screen when the server refuses, rather than showing a conflict", async () => {
    fetchSiteQr.mockRejectedValue(
      new ApiError("nope", 409, {}, { code: "PAID_PLAN_REQUIRED" }),
    );

    show();

    expect(await screen.findByTestId("qr-locked-FREE_PLAN")).toBeInTheDocument();
  });

  it("warns that an unconfirmed domain will not be on the card", async () => {
    fetchSiteDetail.mockResolvedValue(
      detail({
        domains: [
          { id: "d1", hostname: "marita.ge", primaryDomain: true, verified: false },
        ],
      }),
    );

    show();

    expect(await screen.findByText(/marita\.ge is not confirmed yet/)).toBeInTheDocument();
  });
});

describe("qrFilename", () => {
  it("names the file after the slug, per format", () => {
    expect(qrFilename("marita", "png")).toBe("marita-qr.png");
    expect(qrFilename("marita", "pdf")).toBe("marita-qr.pdf");
  });

  it("survives a slug that is not filesystem-safe", () => {
    expect(qrFilename(" Cafe Marita! ", "pdf")).toBe("cafe-marita-qr.pdf");
    expect(qrFilename("!!", "png")).toBe("site-qr.png");
  });
});

describe("qrPaidBlock", () => {
  it("keeps 'never paid' and 'stopped paying' apart", () => {
    const problem = (code: string) =>
      new ApiError("x", 409, {}, { code });
    expect(qrPaidBlock(problem("PAID_PLAN_REQUIRED"), null)).toBe("FREE_PLAN");
    expect(qrPaidBlock(problem("SUBSCRIPTION_EXPIRED"), null)).toBe("LAPSED");
    expect(qrPaidBlock(problem("SUBSCRIPTION_CANCELLED"), null)).toBe("LAPSED");
  });

  it("is not a subscription problem just because it is a refusal", () => {
    expect(qrPaidBlock(new ApiError("x", 403, {}, { code: "FORBIDDEN" }), "FREE_PLAN")).toBeNull();
    expect(qrPaidBlock(new ApiError("x", 404, {}, { code: "NOT_FOUND" }), "FREE_PLAN")).toBeNull();
    expect(qrPaidBlock(new Error("offline"), "FREE_PLAN")).toBeNull();
  });

  it("falls back to what local state believes on an unnamed 409", () => {
    expect(qrPaidBlock(new ApiError("x", 409), "LAPSED")).toBe("LAPSED");
    expect(qrPaidBlock(new ApiError("x", 409), null)).toBeNull();
  });
});

describe("pendingDomain", () => {
  const domain = (hostname: string, verified: boolean, primary = false) => ({
    id: hostname,
    hostname,
    primaryDomain: primary,
    verified,
  });

  it("names an unconfirmed domain so nobody prints a dead address", () => {
    expect(pendingDomain([domain("marita.ge", false)])).toBe("marita.ge");
  });

  it("says nothing once anything is confirmed", () => {
    expect(
      pendingDomain([domain("marita.ge", true), domain("old.ge", false)]),
    ).toBeUndefined();
    expect(pendingDomain([])).toBeUndefined();
    expect(pendingDomain(undefined)).toBeUndefined();
  });

  it("prefers the one the client marked primary", () => {
    expect(
      pendingDomain([domain("old.ge", false), domain("marita.ge", false, true)]),
    ).toBe("marita.ge");
  });
});
