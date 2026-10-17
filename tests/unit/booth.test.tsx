import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Booth } from "@/components/signature/Booth";

const topics = ["Describe your perfect weekend.", "What does confidence mean to you?"];

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("Booth (Table Topics, signature moment S4)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "performance"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    const view = render(<Booth topics={topics} />);
    const booth = view.container.querySelector<HTMLElement>(".booth")!;
    fireEvent.click(screen.getByRole("button", { name: "Give me a topic" }));
    fireEvent.click(screen.getByRole("button", { name: "Start speaking" }));
    return booth;
  };

  it("cannot start before a topic is chosen", () => {
    render(<Booth topics={topics} />);
    expect(screen.getByRole("button", { name: "Start speaking" })).toBeDisabled();
  });

  it("shows a topic from the list", () => {
    render(<Booth topics={topics} />);
    fireEvent.click(screen.getByRole("button", { name: "Give me a topic" }));
    expect(topics.some((topic) => screen.queryByText(topic))).toBe(true);
  });

  it("turns green at 1:00, amber at 1:30 and red at 2:00, and announces each", () => {
    const booth = setup();
    advance(59_000);
    expect(booth.dataset.signal).toBe("off");
    advance(1_500);
    expect(booth.dataset.signal).toBe("green");
    expect(screen.getByText(/Green light: one minute/)).toBeInTheDocument();
    advance(30_000);
    expect(booth.dataset.signal).toBe("amber");
    advance(30_000);
    expect(booth.dataset.signal).toBe("red");
    expect(screen.getByRole("timer")).toHaveTextContent("2:00");
  });

  it("pauses, resumes from the same time, and invites the guest to a real meeting", () => {
    setup();
    advance(65_000);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText(/You just did a Table Topic/)).toBeInTheDocument();
    advance(30_000);
    expect(screen.getByRole("timer")).toHaveTextContent("1:05");
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    advance(10_000);
    expect(screen.getByRole("timer")).toHaveTextContent("1:15");
  });

  it("stops by itself 30 seconds after red, and resets to zero", () => {
    setup();
    advance(200_000);
    expect(screen.getByRole("timer")).toHaveTextContent("2:30");
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("timer")).toHaveTextContent("0:00");
  });
});
