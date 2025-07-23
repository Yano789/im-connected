import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import ForumBody from "../Forum/ForumBody/ForumBody";
import { MemoryRouter } from "react-router-dom";

// Mock child components that might call useNavigate
vi.mock("../Forum/ForumCard/ForumCard", () => ({
  default: (props) => (
    <div data-testid="mock-forum-card">{props.postTitle || "MockCard"}</div>
  ),
}));

vi.mock("../Forum/ToPost/ToPost", () => ({
  default: () => <div data-testid="mock-to-post">ToPost</div>,
}));

vi.mock("../Forum/Filter/Filter", () => ({
  default: ({ onFilter }) => (
    <button data-testid="mock-filter" onClick={() => onFilter({ sort: "top" })}>
      Filter
    </button>
  ),
}));

vi.mock("../Forum/TopicSelector/TopicSelector", () => ({
  default: ({ onTagFilterChange }) => (
    <button
      data-testid="mock-topic-selector"
      onClick={() => onTagFilterChange("React")}
    >
      TopicSelector
    </button>
  ),
}));

vi.mock("../Forum/Bookmark/Bookmark", () => ({
  default: () => <div data-testid="mock-bookmark">Bookmark</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe("ForumBody", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  it("renders loading and then post cards", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            postId: "123",
            username: "Alice",
            createdAt: "2023-01-01",
            title: "Test Post",
            tags: ["React"],
            content: "Test content",
            comments: [],
            likes: [],
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // saved
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // liked
      });

    render(
      <MemoryRouter>
        <ForumBody />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("mock-forum-card")).toBeInTheDocument();
    });
  });

  it("renders error message on fetch fail", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <MemoryRouter>
        <ForumBody />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it("renders 'No posts available' when post array is empty", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(
      <MemoryRouter>
        <ForumBody />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No posts available.")).toBeInTheDocument();
    });
  });
});
