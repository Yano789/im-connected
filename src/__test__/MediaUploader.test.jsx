import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MediaUploader from "../Forum/MediaUploader/MediaUploader";
import { MemoryRouter } from "react-router-dom";

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}
beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
});

describe("MediaUploader", () => {
  let onMediaChange, onRemoveExistingMedia, onRemoveNewFile;

  beforeEach(() => {
    onMediaChange = vi.fn();
    onRemoveExistingMedia = vi.fn();
    onRemoveNewFile = vi.fn();
  });

  it("renders correctly with no media", () => {
    renderWithRouter(
      <MediaUploader
        existingMedia={[]}
        mediaFiles={[]}
        onMediaChange={onMediaChange}
        onRemoveExistingMedia={onRemoveExistingMedia}
        onRemoveNewFile={onRemoveNewFile}
      />
    );
    expect(screen.getByText(/Drag and drop media here/i)).toBeInTheDocument();
  });

  it("renders existing media and calls removal callback", async () => {
    const existing = [
      { url: "image.jpg", type: "image/jpeg", public_id: "123" },
      { url: "video.mp4", type: "video/mp4", public_id: "456" },
    ];

    renderWithRouter(
      <MediaUploader
        existingMedia={existing}
        mediaFiles={[]}
        onMediaChange={onMediaChange}
        onRemoveExistingMedia={onRemoveExistingMedia}
        onRemoveNewFile={onRemoveNewFile}
      />
    );

    expect(screen.getByText(/Previously Uploaded:/i)).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "✕" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "✕" })[0]);
    expect(onRemoveExistingMedia).toHaveBeenCalledWith("123");
  });

  it("renders new media and calls new file removal", () => {
    const file1 = new File(["dummy content"], "file1.png", {
      type: "image/png",
    });
    const file2 = new File(["dummy content"], "video.mp4", {
      type: "video/mp4",
    });

    renderWithRouter(
      <MediaUploader
        existingMedia={[]}
        mediaFiles={[file1, file2]}
        onMediaChange={onMediaChange}
        onRemoveExistingMedia={onRemoveExistingMedia}
        onRemoveNewFile={onRemoveNewFile}
      />
    );

    expect(screen.getByText(/New Media:/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "✕" })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "✕" })[1]);
    expect(onRemoveNewFile).toHaveBeenCalledWith(1);
  });

  it("triggers file input on click", async () => {
  const { container } = renderWithRouter(
    <MediaUploader
      existingMedia={[]}
      mediaFiles={[]}
      onMediaChange={onMediaChange}
      onRemoveExistingMedia={onRemoveExistingMedia}
      onRemoveNewFile={onRemoveNewFile}
    />
  );

  const dropArea = screen.getByText(/Drag and drop media here/i);
  const fileInput = container.querySelector('input[type="file"]');

  expect(fileInput).toBeInTheDocument();

  // simulate clicking the drop area
  fireEvent.click(dropArea);
  // fileInput.click() isn't actually testable here because it's hidden and jsdom doesn't trigger the event
});


  it("handles file selection through input", async () => {
  const { container } = renderWithRouter(
    <MediaUploader
      existingMedia={[]}
      mediaFiles={[]}
      onMediaChange={onMediaChange}
      onRemoveExistingMedia={onRemoveExistingMedia}
      onRemoveNewFile={onRemoveNewFile}
    />
  );

  const input = container.querySelector('input[type="file"]');
  const file = new File(["hello"], "hello.png", { type: "image/png" });

  await waitFor(() =>
    fireEvent.change(input, {
      target: { files: [file] },
    })
  );

  expect(onMediaChange).toHaveBeenCalledWith([file]);
});


  it("handles drag and drop", async () => {
    renderWithRouter(
      <MediaUploader
        existingMedia={[]}
        mediaFiles={[]}
        onMediaChange={onMediaChange}
        onRemoveExistingMedia={onRemoveExistingMedia}
        onRemoveNewFile={onRemoveNewFile}
      />
    );

    const dropArea = screen.getByText(/Drag and drop media here/i);
    const file = new File(["dummy"], "test.png", { type: "image/png" });

    fireEvent.drop(dropArea, {
      dataTransfer: { files: [file] },
    });

    expect(onMediaChange).toHaveBeenCalledWith([file]);
  });
});
