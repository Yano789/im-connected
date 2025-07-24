import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NewPostCard from "../Forum/NewPostCard/NewPostCard";

// Mock navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("NewPostCard", () => {
  let onDraftAddedMock;

  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ _id: "mock-id" }),
      })
    );
    onDraftAddedMock = vi.fn();
  });

  const renderWithRouter = (ui) =>
    render(<BrowserRouter>{ui}</BrowserRouter>);

  it("renders input fields and buttons", () => {
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} />);
    expect(screen.getByPlaceholderText("Suggest a name for this Text")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add your post's contents here")).toBeInTheDocument();
    expect(screen.getByText("Save as Draft")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeInTheDocument();
  });

  it("allows entering title and content", () => {
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} />);
    fireEvent.change(screen.getByPlaceholderText("Suggest a name for this Text"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByPlaceholderText("Add your post's contents here"), {
      target: { value: "Test Content" },
    });

    expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Content")).toBeInTheDocument();
  });

  it("toggles tag selection up to 2", () => {
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} />);
    const tags = screen.getAllByText(/Disability|Care|Support|Health|Clinics/i);
    fireEvent.click(tags[0]);
    fireEvent.click(tags[1]);
    fireEvent.click(tags[2]); // Should be ignored (limit 2)

    const selected = document.querySelectorAll(".newPostTagSelected");
    expect(selected.length).toBe(2);
  });

  it("loads draft data if renderDraft is provided", () => {
    const renderDraft = {
      _id: "mock-id",
      postId: "mock-post-id",
      title: "Draft Title",
      content: "Draft content",
      tags: ["Mental Disability", "Subsidies and Govt Support"],
      media: [],
    };
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} renderDraft={renderDraft} />);

    expect(screen.getByDisplayValue("Draft Title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Draft content")).toBeInTheDocument();
    expect(document.querySelectorAll(".newPostTagSelected").length).toBe(2);
  });

  it("calls fetch with draft=false when 'Post' is clicked", async () => {
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} />);

    fireEvent.click(screen.getByText("Post"));

    expect(global.fetch).toHaveBeenCalled();
    const call = global.fetch.mock.calls[0];
    expect(call[0]).toMatch(/\/post\/create$/);
  });

  it("calls fetch with draft=true when 'Save as Draft' is clicked", async () => {
    renderWithRouter(<NewPostCard onDraftAdded={onDraftAddedMock} />);

    fireEvent.click(screen.getByText("Save as Draft"));

    expect(global.fetch).toHaveBeenCalled();
    const call = global.fetch.mock.calls[0];
    expect(call[1].body.get("draft")).toBe("true");
  });
});
