import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import { apiErrorMessage } from "../lib/api";

describe("apiErrorMessage", () => {
  it("extracts the backend's specific error message", () => {
    const err = new AxiosError("Request failed");
    err.response = {
      data: { error: "Username is already taken" },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as never,
    };
    // This is exactly the old crowdstudio bug: reading err.message (always
    // undefined on an Axios error) instead of err.response.data.error.
    expect(apiErrorMessage(err)).toBe("Username is already taken");
  });

  it("gives a clear message for network failures", () => {
    const err = new AxiosError("Network Error");
    err.code = "ERR_NETWORK";
    expect(apiErrorMessage(err)).toMatch(/can't reach the server/i);
  });

  it("gives a clear message for timeouts", () => {
    const err = new AxiosError("timeout of 10000ms exceeded");
    err.code = "ECONNABORTED";
    expect(apiErrorMessage(err)).toMatch(/timed out/i);
  });

  it("gives a clear message for rate limiting", () => {
    const err = new AxiosError("Request failed");
    err.response = { data: {}, status: 429, statusText: "", headers: {}, config: {} as never };
    expect(apiErrorMessage(err)).toMatch(/too many requests/i);
  });

  it("falls back to the provided default for unrecognized errors", () => {
    expect(apiErrorMessage(new Error("some unexpected thing"), "Custom fallback")).toBe("Custom fallback");
  });
});
