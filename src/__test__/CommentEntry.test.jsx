import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommentEntry from "../Forum/CommentEntry/CommentEntry";
import { vi } from "vitest";

// Mock global fetch
global.fetch = vi.fn();

describe("CommentEntry", () => {
  const baseComment = {
    commentId: "c1",
    username: "testuser",
    createdAt: new Date().toISOString(),
    content: "Original content",
    children: [],
  };

  const postId = "p123";
  const refreshMock = vi.fn();
  const deleteMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders comment content and username", () => {
    render(
      <CommentEntry
        comment={baseComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("Original content")).toBeInTheDocument();
  });

  it("calls onDelete when Delete is clicked", () => {
    render(
      <CommentEntry
        comment={baseComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(deleteMock).toHaveBeenCalledWith("c1");
  });

  it("enters edit mode and saves edited comment", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: "Updated content" }),
    });

    render(
      <CommentEntry
        comment={baseComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    const textarea = screen.getByDisplayValue("Original content");
    fireEvent.change(textarea, { target: { value: "Updated content" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(screen.getByText("Updated content")).toBeInTheDocument()
    );
  });

  it("cancels edit and restores original content", () => {
    render(
      <CommentEntry
        comment={baseComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    const textarea = screen.getByDisplayValue("Original content");
    fireEvent.change(textarea, { target: { value: "Changed" } });
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("Original content")).toBeInTheDocument();
  });

  it("enters reply mode and posts a reply", async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    render(
      <CommentEntry
        comment={baseComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    fireEvent.click(screen.getByText("Reply"));
    const replyBox = screen.getByPlaceholderText("Write your reply...");
    fireEvent.change(replyBox, { target: { value: "My reply" } });
    fireEvent.click(screen.getByText("Post Reply"));

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("renders nested child comments", () => {
    const nestedComment = {
      ...baseComment,
      children: [
        {
          _id: "child1",
          commentId: "child1",
          username: "childuser",
          createdAt: new Date().toISOString(),
          content: "Nested comment",
          children: [],
        },
      ],
    };

    render(
      <CommentEntry
        comment={nestedComment}
        postId={postId}
        refreshComments={refreshMock}
        onDelete={deleteMock}
      />
    );

    expect(screen.getByText("Nested comment")).toBeInTheDocument();
    expect(screen.getByText("childuser")).toBeInTheDocument();
  });
});
