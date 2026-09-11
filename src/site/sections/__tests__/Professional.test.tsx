import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import type { PublicSection } from "../../api/types";
import { SiteProvider } from "../../context";
import {
  CredentialsCards,
  CredentialsTimeline,
  RatesCards,
  RatesTable,
} from "../Professional";
import { credentialsSection, ratesSection, sitePayload } from "./fixtures";

function renderSection(node: ReactElement, section: PublicSection) {
  return render(
    <SiteProvider
      payload={sitePayload([section])}
      siteRef="demo-teacher-simple"
      onLanguageChange={() => {}}
      onOpenProduct={() => {}}
      onCloseProduct={() => {}}
    >
      {node}
    </SiteProvider>,
  );
}

describe("credentials", () => {
  it.each([
    ["timeline", CredentialsTimeline],
    ["cards", CredentialsCards],
  ])("renders every entry in the %s variant", (variant, Component) => {
    const section = credentialsSection({ variant });
    renderSection(<Component section={section} />, section);

    expect(screen.getByText("Qualifications")).toBeInTheDocument();
    expect(screen.getByText("MA in Applied Linguistics")).toBeInTheDocument();
    expect(screen.getByText("Tbilisi State University")).toBeInTheDocument();
    expect(screen.getByText("2018 — 2022")).toBeInTheDocument();
    // The entry carrying nothing but a title still has to appear.
    expect(screen.getByText("Volunteer tutor")).toBeInTheDocument();
  });

  it.each([
    ["timeline", CredentialsTimeline],
    ["cards", CredentialsCards],
  ])("renders nothing when %s has no entries", (variant, Component) => {
    const section = credentialsSection({
      variant,
      content: { title: "Qualifications", items: [] },
    });
    const { container } = renderSection(<Component section={section} />, section);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ["timeline", CredentialsTimeline],
    ["cards", CredentialsCards],
  ])("survives a null content payload in the %s variant", (_v, Component) => {
    const section = credentialsSection({ content: null });
    const { container } = renderSection(<Component section={section} />, section);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("rates", () => {
  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("prints price and unit verbatim in the %s variant", (variant, Component) => {
    const section = ratesSection({ variant });
    renderSection(<Component section={section} />, section);

    // Straight through, untouched: no currency formatter, no minor units.
    expect(screen.getByText("45 GEL")).toBeInTheDocument();
    expect(screen.getByText("per hour")).toBeInTheDocument();
    expect(screen.getByText("400 GEL")).toBeInTheDocument();
  });

  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("renders every package in the %s variant", (variant, Component) => {
    const section = ratesSection({ variant });
    renderSection(<Component section={section} />, section);

    expect(screen.getByText("Single lesson")).toBeInTheDocument();
    expect(screen.getByText("Ten-lesson pack")).toBeInTheDocument();
    // No price, no bullets, no CTA — the name alone is enough to render.
    expect(screen.getByText("Exam preparation")).toBeInTheDocument();
  });

  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("keeps readable bullets and drops empty ones in %s", (variant, Component) => {
    const section = ratesSection({ variant });
    renderSection(<Component section={section} />, section);

    expect(screen.getByText("60 minutes")).toBeInTheDocument();
    expect(screen.getByText("Save 50 GEL")).toBeInTheDocument();
    // A bare string is not the contract shape but still reads correctly.
    expect(screen.getByText("Flexible scheduling")).toBeInTheDocument();
    // The blank and the empty object drew no rows, so the pack has two.
    expect(screen.getAllByRole("listitem")).toHaveLength(
      variant === "cards" ? 4 : 7,
    );
  });

  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("links a CTA only where one was written in %s", (_v, Component) => {
    const section = ratesSection();
    renderSection(<Component section={section} />, section);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "#contact");
    // No `ctaHref` was given for the pack, so it falls back to the contact form
    // rather than to a dead link or a checkout.
    expect(links[1]).toHaveAttribute("href", "#contact");
  });

  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("renders nothing when %s has no packages", (variant, Component) => {
    const section = ratesSection({ variant, content: { items: [] } });
    const { container } = renderSection(<Component section={section} />, section);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ["cards", RatesCards],
    ["table", RatesTable],
  ])("never reaches the buying stack from the %s variant", (_v, Component) => {
    const section = ratesSection();
    renderSection(<Component section={section} />, section);

    // A rate card is an advertisement. The categories it belongs to cannot take
    // orders at all, so a button here would be one no visitor could complete.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
