import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import DraftPosts from "../Forum/DraftPosts/DraftPosts";

const mockDrafts = [
  {
    _id: "1",
    postId: "post-1",
    title: "Draft 1",
    content: "First draft content",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    postId: "post-2",
    title: "Draft 2",
    content: "Second draft content",
    createdAt: new Date().toISOString(),
  },
];

describe("DraftPosts", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading initially", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrafts,
    });

    render(<DraftPosts refreshTrigger={0} onDraftSelected={() => {}} />);
    expect(screen.getByText(/loading drafts/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Draft 1")).toBeInTheDocument();
    });
  });

  it("renders fetched drafts", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDrafts,
    });

    render(<DraftPosts refreshTrigger={0} onDraftSelected={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Draft 1")).toBeInTheDocument();
      expect(screen.getByText("Draft 2")).toBeInTheDocument();
    });
  });

  it("shows error on fetch failure", async () => {
    fetch.mockRejectedValueOnce(new Error("network fail"));

    render(<DraftPosts refreshTrigger={0} onDraftSelected={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("shows no drafts message when empty", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<DraftPosts refreshTrigger={0} onDraftSelected={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/no drafts/i)).toBeInTheDocument();
    });
  });
});
