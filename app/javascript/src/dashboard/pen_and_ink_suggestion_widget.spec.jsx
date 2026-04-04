import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PenAndInkSuggestionWidget } from "./pen_and_ink_suggestion_widget";

jest.mock("./widgets", () => ({
  Widget: ({ header, subtitle, children }) => (
    <div>
      <h2>{header}</h2>
      <p>{subtitle}</p>
      {children}
    </div>
  )
}));

const mockGetRequest = jest.fn();

jest.mock("../fetch", () => ({
  getRequest: (...args) => mockGetRequest(...args)
}));

describe("<PenAndInkSuggestionWidget />", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    mockGetRequest.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
      if (String(args[0]).includes("not wrapped in act")) {
        return;
      }
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it("renders widget header, subtitle, and initial controls", () => {
    render(<PenAndInkSuggestionWidget />);

    expect(screen.getByText("Pen & Ink Suggestion")).toBeInTheDocument();
    expect(screen.getByText("Gives suggestions on what to ink next using AI™")).toBeInTheDocument();
    expect(screen.getByText("Suggest something!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add extra instructions/i)).toBeInTheDocument();
  });

  it("requests and polls a suggestion, then renders suggestion and ink-up link", async () => {
    mockGetRequest
      .mockResolvedValueOnce({
        json: async () => ({ suggestion_id: "abc-123" })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          message: "<strong>Try this pairing</strong>",
          ink: { id: 42 },
          pen: { id: 7 }
        })
      });

    render(<PenAndInkSuggestionWidget />);

    fireEvent.change(screen.getByPlaceholderText(/Add extra instructions/i), {
      target: { value: "blue inks only" }
    });
    fireEvent.click(screen.getByText("Suggest something!"));

    await waitFor(() => {
      expect(mockGetRequest).toHaveBeenCalledWith(
        expect.stringContaining("/dashboard/widgets/pen_and_ink_suggestion.json?extra_user_input=")
      );
      expect(mockGetRequest).toHaveBeenCalledWith(
        expect.stringContaining("extra_user_input=blue%20inks%20only")
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("Try this pairing")).toBeInTheDocument();
    });

    expect(screen.getByText("Ink it Up!")).toHaveAttribute(
      "href",
      "/currently_inked/new?collected_ink_id=42&collected_pen_id=7"
    );
    expect(screen.getByText("Try again!")).toBeInTheDocument();
  });

  it("includes previously rejected suggestions in hidden_input on retry", async () => {
    mockGetRequest
      .mockResolvedValueOnce({ json: async () => ({ suggestion_id: "first" }) })
      .mockResolvedValueOnce({
        json: async () => ({ message: "first result", ink: { id: 11 }, pen: { id: 22 } })
      })
      .mockResolvedValueOnce({ json: async () => ({ suggestion_id: "second" }) })
      .mockResolvedValueOnce({
        json: async () => ({ message: "second result", ink: { id: 33 }, pen: { id: 44 } })
      });

    render(<PenAndInkSuggestionWidget />);

    fireEvent.click(screen.getByText("Suggest something!"));

    await waitFor(() => {
      expect(mockGetRequest).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText("first result")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Try again!"));

    await waitFor(() => {
      const secondRequestUrl = mockGetRequest.mock.calls[2][0];
      expect(secondRequestUrl).toContain("hidden_input=");
      expect(decodeURIComponent(secondRequestUrl)).toContain(
        "The following suggestions were rejected. Do not recommend them again"
      );
      expect(decodeURIComponent(secondRequestUrl)).toContain('"ink_id":11');
      expect(decodeURIComponent(secondRequestUrl)).toContain('"pen_id":22');
    });
  });

  it("returns from loading state when initial request fails", async () => {
    mockGetRequest.mockRejectedValueOnce(new Error("network error"));

    render(<PenAndInkSuggestionWidget />);
    fireEvent.click(screen.getByText("Suggest something!"));

    await waitFor(() => {
      expect(screen.getByText("Suggest something!")).toBeInTheDocument();
    });
  });
});
