import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NewPost from "../Forum/NewPost/NewPost";
import { MemoryRouter } from "react-router-dom";

// Mock child components
vi.mock("../TopHeader/Header/Header", () => ({
  default: () => <div>MockHeader</div>,
}));

vi.mock("../Forum/NewPostBody/NewPostBody", () => ({
  default: () => <div>MockNewPostBody</div>,
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("NewPost", () => {
  it("renders Header and NewPostBody", () => {
    renderWithRouter(<NewPost />);
    expect(screen.getByText("MockHeader")).toBeInTheDocument();
    expect(screen.getByText("MockNewPostBody")).toBeInTheDocument();
  });
});
