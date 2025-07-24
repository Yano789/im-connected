import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MyPostBody from "../Forum/MyPostBody/MyPostBody";
import { MemoryRouter } from "react-router-dom";

// Mock child components
vi.mock("../Forum/ForumCard/ForumCard", () => ({
  default: ({ postTitle, ActionButton }) => (
    <div>
      <div>{postTitle}</div>
      <ActionButton />
    </div>
  ),
}));

vi.mock("../Forum/Filter/Filter", () => ({
  default: ({ onFilter }) => (
    <button onClick={() => onFilter({ sort: "oldest" })}>MockFilter</button>
  ),
}));

vi.mock("../Forum/ToPost/ToPost", () => ({
  default: () => <div>MockToPost</div>,
}));

vi.mock("../Forum/TopicSelector/TopicSelector", () => ({
  default: ({ onTagFilterChange }) => (
    <button onClick={() => onTagFilterChange("testTag")}>MockTopicSelector</button>
  ),
}));

vi.mock("../Forum/Delete/Delete", () => ({
  default: ({ onDelete }) => (
    <button onClick={onDelete} data-testid="delete-button">
      Delete
    </button>
  ),
}));

// Helper
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("MyPostBody", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("displays loading state initially", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<MyPostBody />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("displays error message when post fetch fails", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithRouter(<MyPostBody />);
    await waitFor(() =>
      expect(screen.getByText(/Error: Failed to fetch your posts/i)).toBeInTheDocument()
    );
  });

  it("displays fallback text when no posts are returned", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<MyPostBody />);
    await waitFor(() =>
      expect(screen.getByText(/You haven’t posted anything yet/i)).toBeInTheDocument()
    );
  });

  it("renders posts correctly when returned", async () => {
    const posts = [
      {
        postId: "abc123",
        username: "testuser",
        createdAt: new Date().toISOString(),
        title: "Test Post",
        tags: [],
        content: "Lorem ipsum",
        comments: [],
        likes: 5,
      },
    ];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => posts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<MyPostBody />);

    await waitFor(() => {
      expect(screen.getByText("Test Post")).toBeInTheDocument();
    });
  });

  it("removes a post when Delete button is clicked", async () => {
    const posts = [
      {
        postId: "abc123",
        username: "testuser",
        createdAt: new Date().toISOString(),
        title: "Deletable Post",
        tags: [],
        content: "To be removed",
        comments: [],
        likes: 2,
      },
    ];

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => posts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithRouter(<MyPostBody />);

    await waitFor(() =>
      expect(screen.getByText("Deletable Post")).toBeInTheDocument()
    );

    const deleteBtn = screen.getByTestId("delete-button");
    deleteBtn.click();

    await waitFor(() =>
      expect(screen.queryByText("Deletable Post")).not.toBeInTheDocument()
    );
  });

  it("updates posts when Filter is clicked", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial posts
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // liked posts
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          postId: "abc999",
          username: "filteredUser",
          createdAt: new Date().toISOString(),
          title: "Filtered Post",
          tags: [],
          content: "Filtered",
          comments: [],
          likes: 0,
        },
      ],
    });

    renderWithRouter(<MyPostBody />);
    await waitFor(() =>
      expect(screen.getByText(/You haven’t posted anything yet/i)).toBeInTheDocument()
    );

    screen.getByText("MockFilter").click();

    await waitFor(() =>
      expect(screen.getByText("Filtered Post")).toBeInTheDocument()
    );
  });
});
