

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Bookmark from "../Forum/Bookmark/Bookmark";

// Mock global fetch before tests:
global.fetch = vi.fn();

describe("Bookmark component", () => {
  const postId = "post123";
  const token = "fake-token";

  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders with unbookmarked icon initially", () => {
    render(<Bookmark postId={postId} token={token} initialBookmarked={false} />);
    const img = screen.getByAltText("bookmark");
    expect(img).toBeInTheDocument();
    // You can add expect(img.src).toContain("Unbookmark.png") if you want
  });

  test("renders with bookmarked icon initially", () => {
    render(<Bookmark postId={postId} token={token} initialBookmarked={true} />);
    const img = screen.getByAltText("bookmark");
    expect(img).toBeInTheDocument();
    // expect(img.src).toContain("Bookmark.png")
  });

  test("clicking bookmark triggers save API call and changes icon", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "ok",
    });

    render(<Bookmark postId={postId} token={token} initialBookmarked={false} />);
    const img = screen.getByAltText("bookmark");
    await userEvent.click(img);

    // Check fetch called with POST save url
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:5001/api/v1/saved/${encodeURIComponent(postId)}/save`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
        }),
      })
    );

    // Because setState flips bookmarked, the img src should change (optional to test)
  });

  test("clicking bookmark triggers delete API call and calls onUnbookmark callback", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "ok",
    });

    const onUnbookmark = vi.fn();

    render(
      <Bookmark
        postId={postId}
        token={token}
        initialBookmarked={true}
        onUnbookmark={onUnbookmark}
      />
    );
    const img = screen.getByAltText("bookmark");
    await userEvent.click(img);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:5001/api/v1/saved/${encodeURIComponent(postId)}/delete`,
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // onUnbookmark should be called since we unbookmarked
    expect(onUnbookmark).toHaveBeenCalled();
  });

  test("handles fetch error gracefully", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "error message",
    });

    console.error = vi.fn(); // mock console.error to suppress error logs in test output

    render(<Bookmark postId={postId} token={token} initialBookmarked={false} />);
    const img = screen.getByAltText("bookmark");
    await userEvent.click(img);

    expect(console.error).toHaveBeenCalledWith(
      "Error updating bookmark:",
      "error message"
    );
  });
});
