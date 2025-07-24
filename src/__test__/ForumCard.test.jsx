import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ForumCard from "../Forum/ForumCard/ForumCard";
import { MemoryRouter } from "react-router-dom";

const mockActionButton = vi.fn(() => <button data-testid="action-button">Action</button>);

// Mock fetch globally
global.fetch = vi.fn();

describe("ForumCard", () => {
  const defaultProps = {
    postId: "abc123",
    postUser: "Alice",
    postDate: "2025-07-23",
    postTitle: "Test Post",
    postTags: ["tag1", "tag2"],
    postDescription: "This is a test post description.",
    ActionButton: mockActionButton,
    postComment: 5,
    postLikes: 10,
    initiallyLiked: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders post info and tags correctly", () => {
    render(
      <MemoryRouter>
        <ForumCard {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("Posted:")).toBeInTheDocument();
    expect(screen.getByText("2025-07-23")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();

    
    expect(screen.getByText(defaultProps.postDescription)).toBeInTheDocument();

    
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    
    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });

  it("shows 'No tags' if postTags is empty or undefined", () => {
    const props = { ...defaultProps, postTags: [] };
    render(
      <MemoryRouter>
        <ForumCard {...props} />
      </MemoryRouter>
    );
    expect(screen.getByText("No tags")).toBeInTheDocument();
  });

  it("navigates to correct URL on card click", () => {
    
    const mockNavigate = vi.fn();

    // Mock react-router-dom's useNavigate
    vi.doMock("react-router-dom", async () => {
      const actual = await vi.importActual("react-router-dom");
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });


  });

  it("toggles like on like icon click and updates like count", async () => {

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ likes: 11 }),
    });

    render(
      <MemoryRouter>
        <ForumCard {...defaultProps} />
      </MemoryRouter>
    );

    const likeDiv = screen.getByText("10").parentElement; 

    // Click to like
    fireEvent.click(likeDiv);

    // Wait for state update
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/v1/like/${encodeURIComponent(defaultProps.postId)}/like`,
        expect.objectContaining({ method: "POST", credentials: "include" })
      );
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  it("toggles unlike on like icon click when initiallyLiked is true", async () => {
    // Mock fetch response for unliking post
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ likes: 9 }),
    });

    render(
      <MemoryRouter>
        <ForumCard {...defaultProps} initiallyLiked={true} postLikes={10} />
      </MemoryRouter>
    );

    const likeDiv = screen.getByText("10").parentElement;

    // Click to unlike
    fireEvent.click(likeDiv);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/v1/like/${encodeURIComponent(defaultProps.postId)}/unlike`,
        expect.objectContaining({ method: "DELETE", credentials: "include" })
      );
      expect(screen.getByText("9")).toBeInTheDocument();
    });
  });

  it("logs error on fetch failure during like toggle", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <MemoryRouter>
        <ForumCard {...defaultProps} />
      </MemoryRouter>
    );

    const likeDiv = screen.getByText("10").parentElement;

    fireEvent.click(likeDiv);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error toggling like:",
        expect.any(String)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
