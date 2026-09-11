import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Every test renders into the same jsdom document, so unmount between cases to
// keep queries from matching leftovers of a previous render.
afterEach(() => {
  cleanup();
});
