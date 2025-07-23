import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyPost from "../Forum/MyPost/MyPost";

vi.mock("../TopHeader/Header/Header", () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>,
}));

vi.mock("../Forum/MyPostBody/MyPostBody", () => ({
  default: () => <div data-testid="mock-mypost-body">Mock MyPostBody</div>,
}));

describe("MyPost component", () => {
  it("renders Header and MyPostBody components", () => {
    render(
      <MemoryRouter>
        <MyPost />
      </MemoryRouter>
    );
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-mypost-body")).toBeInTheDocument();
  });
});
