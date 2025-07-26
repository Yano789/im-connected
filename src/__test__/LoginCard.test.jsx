import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LoginCard from "../Login/LoginCard";

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginCard component", () => {
  const mockSetUser = vi.fn();
  const mockAuthContextValue = {
    setUser: mockSetUser,
    user: null,
    loading: false,
  };

  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    mockSetUser.mockClear();
    localStorage.clear();
  });

  const renderLoginCard = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <LoginCard />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("renders login form with required fields", () => {
    renderLoginCard();

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  test("submits form with correct data and navigates to forum", async () => {
    const user = userEvent.setup();
    const mockUser = {
      username: "Bearson",
      password: "Password!",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    renderLoginCard();

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await user.type(usernameInput, "Bearson");
    await user.type(passwordInput, "Password!");
    await user.click(loginButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/user",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: "Bearson",
          password: "Password!",
          rememberMe: false,
        }),
      })
    );

    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockNavigate).toHaveBeenCalledWith("/forum");
  });

  test("displays error message when login fails", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });

    renderLoginCard();

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await user.type(usernameInput, "Bearson");
    await user.type(passwordInput, "wrongpassword");
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Login failed: Invalid credentials/)).toBeInTheDocument();
    });
  });

  test("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderLoginCard();

    const passwordInput = screen.getByPlaceholderText("••••••••");
    const toggleButton = screen.getByText("Show");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByText("Hide")).toBeInTheDocument();

    await user.click(screen.getByText("Hide"));
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByText("Show")).toBeInTheDocument();
  });

  test("handles remember me functionality", async () => {
    const user = userEvent.setup();
    const mockUser = { username: "Bearson" };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    renderLoginCard();

    const rememberMeCheckbox = screen.getByRole("checkbox");
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await user.type(usernameInput, "Bearson");
    await user.type(passwordInput, "Password!");
    await user.click(rememberMeCheckbox);
    await user.click(loginButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/user",
      expect.objectContaining({
        body: JSON.stringify({
          username: "Bearson",
          password: "Password!",
          rememberMe: true,
        }),
      })
    );
  });
}); 