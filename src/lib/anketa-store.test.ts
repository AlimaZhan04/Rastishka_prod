/** @jest-environment jsdom */

import { useAnketa } from "./anketa-store";

describe("application source attribution", () => {
  afterEach(() => {
    useAnketa.getState().close();
    window.history.replaceState({}, "", "/");
  });

  it("retains campaign attribution when a visit-format card opens the form directly", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=search&utm_medium=cpc&utm_campaign=parent-support",
    );
    useAnketa
      .getState()
      .open({ visitFormat: "INDIVIDUAL", source: { page: "/", cta: "visit-format" } });
    expect(useAnketa.getState()).toMatchObject({
      isOpen: true,
      visitFormat: "INDIVIDUAL",
      source: {
        page: "/",
        cta: "visit-format",
        utmSource: "search",
        utmMedium: "cpc",
        utmCampaign: "parent-support",
      },
    });
  });

  it("resets the previous selection and attribution when reopened from another page", () => {
    window.history.replaceState({}, "", "/?utm_campaign=first");
    useAnketa.getState().open({ visitFormat: "MORNING" });
    useAnketa.getState().close();
    window.history.replaceState({}, "", "/contacts");
    useAnketa.getState().open();
    expect(useAnketa.getState()).toMatchObject({
      isOpen: true,
      visitFormat: undefined,
      source: { page: "/contacts", utmCampaign: undefined },
    });
  });
});
