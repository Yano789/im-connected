import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Forum from "../Forum/Forum/Forum";

// ✅ Correct mock paths based on your folder structure
vi.mock("../TopHeader/Header/Header", () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>,
}));

vi.mock("../Forum/ForumBody/ForumBody", () => ({
  default: () => <div data-testid="mock-forum-body">Mock ForumBody</div>,
}));

describe("Forum component", () => {
  it("renders Header and ForumBody", () => {
    render(
      <MemoryRouter>
        <Forum />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-forum-body")).toBeInTheDocument();
  });
});
