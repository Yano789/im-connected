import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SavedPost from "../Forum/SavedPost/SavedPost";

vi.mock("../TopHeader/Header/Header", () => ({
  default: () => <div data-testid="header">Mock Header</div>,
}));
vi.mock("../Forum/SavedPostBody/SavedPostBody", () => ({
  default: () => <div data-testid="saved-post-body">Mock SavedPostBody</div>,
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("SavedPost", () => {
  it("renders Header and SavedPostBody components", () => {
    renderWithRouter(<SavedPost />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("saved-post-body")).toBeInTheDocument();
  });
});
