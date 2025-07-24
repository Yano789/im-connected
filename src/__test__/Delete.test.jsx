import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Delete from "../Forum/Delete/Delete";
import { vi } from "vitest";

// Mock globals
global.confirm = vi.fn();
global.alert = vi.fn();
global.fetch = vi.fn();

describe("Delete component", () => {
  const testPostId = "123abc";
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trash icon", () => {
    render(<Delete postToDelete={testPostId} onDelete={mockOnDelete} />);
    const img = screen.getByAltText("delete");
    expect(img).toBeInTheDocument();
  });

  it("does nothing if confirm is false", async () => {
    confirm.mockReturnValueOnce(false);
    render(<Delete postToDelete={testPostId} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByAltText("delete"));
    expect(fetch).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("calls API and onDelete if confirmed and successful", async () => {
    confirm.mockReturnValueOnce(true);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<Delete postToDelete={testPostId} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByAltText("delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/v1/post/${encodeURIComponent(testPostId)}/delete`,
        expect.objectContaining({
          method: "DELETE",
          credentials: "include",
        })
      );
    });

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it("alerts if delete fails", async () => {
    confirm.mockReturnValueOnce(true);
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "Server error",
    });

    render(<Delete postToDelete={testPostId} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByAltText("delete"));

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith("Error deleting post: Server error");
    });

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("alerts if fetch throws", async () => {
    confirm.mockReturnValueOnce(true);
    fetch.mockRejectedValueOnce(new Error("Network down"));

    render(<Delete postToDelete={testPostId} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByAltText("delete"));

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith("Error deleting post: Network down");
    });

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
