import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignUpCard from "../SignUp/SignUpCard";

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SignUpCard component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderSignUpCard = () => {
    return render(
      <MemoryRouter>
        <SignUpCard />
      </MemoryRouter>
    );
  };

  test("renders signup form with required fields", () => {
    renderSignUpCard();

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderSignUpCard();

    await user.type(screen.getByPlaceholderText("Enter your name"), "John Doe");
    await user.type(screen.getByPlaceholderText("Enter your username"), "johndoe");
    await user.type(screen.getByPlaceholderText("Enter your email address"), "john@example.com");
    
    const inputs = screen.getAllByDisplayValue("");
    
    await user.type(inputs[0], "12345678");
    
    await user.type(inputs[1], "password123");
    await user.type(inputs[2], "differentpassword");
    
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("allows country selection", async () => {
    const user = userEvent.setup();
    renderSignUpCard();

    const countryButton = screen.getByText("🇸🇬").closest("button");
    await user.click(countryButton);

    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();

    const usOption = screen.getByText("United States");
    await user.click(usOption);

    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  test("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderSignUpCard();

    const passwordToggles = screen.getAllByText("Show");

    await user.click(passwordToggles[0]);
    expect(screen.getByText("Hide")).toBeInTheDocument();

    await user.click(passwordToggles[1]);
    expect(screen.getAllByText("Hide")).toHaveLength(2);
  });
}); 