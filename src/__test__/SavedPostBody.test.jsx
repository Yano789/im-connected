import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SavedPostBody from "../Forum/SavedPostBody/SavedPostBody";

// Mock ToPost
vi.mock("../Forum/ToPost/ToPost", () => ({
  default: () => <div data-testid="to-post">Mock ToPost</div>,
}));

// Mock Bookmark
vi.mock("../Forum/Bookmark/Bookmark", () => ({
  default: () => <button data-testid="bookmark-button">Mock Bookmark</button>,
}));

// Mock ForumCard
vi.mock("../Forum/ForumCard/ForumCard", () => ({
  default: (props) => {
    const { postTitle, ActionButton } = props;
    return (
      <div data-testid="forum-card">
        <p>{postTitle}</p>
        {ActionButton && <ActionButton />}
      </div>
    );
  },
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("SavedPostBody", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading initially", () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithRouter(<SavedPostBody />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows forum card when posts are fetched", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            postId: "abc123",
            username: "iris",
            createdAt: new Date().toISOString(),
            title: "Test Post",
            tags: ["tag1", "tag2"],
            content: "Some content here",
            comments: [],
            likes: 10,
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ postId: "abc123" }],
      });

    renderWithRouter(<SavedPostBody />);
    await waitFor(() => {
      expect(screen.getByTestId("forum-card")).toBeInTheDocument();
      expect(screen.getByTestId("bookmark-button")).toBeInTheDocument();
    });
  });

  it("shows 'No saved posts' when empty", async () => {
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<SavedPostBody />);
    await waitFor(() => {
      expect(screen.getByText(/no saved posts/i)).toBeInTheDocument();
    });
  });

  it("shows error message on fetch failure", async () => {
    fetch
      .mockResolvedValueOnce({ ok: false }) // Fail on saved
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // Succeed on liked

    renderWithRouter(<SavedPostBody />);
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch saved posts/i)).toBeInTheDocument();
    });
  });
});
