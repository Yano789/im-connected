import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, expect } from "vitest";
import Filter from "../Forum/Filter/Filter";

describe("Filter component", () => {
  it("renders all filter topics", () => {
    render(<Filter />);
    expect(screen.getByText("Newest Post")).toBeInTheDocument();
    expect(screen.getByText("Oldest Post")).toBeInTheDocument();
    expect(screen.getByText("Highest Comments")).toBeInTheDocument();
    expect(screen.getByText("Highest Likes")).toBeInTheDocument();
  });

  it("calls onFilter with correct sort when a filter is clicked", async () => {
    const onFilterMock = vi.fn();
    render(<Filter onFilter={onFilterMock} />);
    const user = userEvent.setup();

    const newest = screen.getByText("Newest Post");
    const oldest = screen.getByText("Oldest Post");
    const comments = screen.getByText("Highest Comments");
    const likes = screen.getByText("Highest Likes");

    await user.click(newest);
    expect(onFilterMock).toHaveBeenLastCalledWith({ sort: "latest" });

    await user.click(oldest);
    expect(onFilterMock).toHaveBeenLastCalledWith({ sort: "earliest" });

    await user.click(comments);
    expect(onFilterMock).toHaveBeenLastCalledWith({ sort: "most comments" });

    await user.click(likes);
    expect(onFilterMock).toHaveBeenLastCalledWith({ sort: "most likes" });
  });

  it("updates clicked state to highlight the active filter", async () => {
    render(<Filter />);
    const user = userEvent.setup();
    const newest = screen.getByText("Newest Post");
    const oldest = screen.getByText("Oldest Post");
    await user.click(newest);
    expect(newest).toBeEnabled();
    await user.click(oldest);
    expect(oldest).toBeEnabled();
  });
});
