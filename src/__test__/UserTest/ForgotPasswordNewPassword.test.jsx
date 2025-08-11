import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPasswordNewPassword from "../../ForgotPassword/ForgotPasswordNewPassword";

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("lucide-react", () => ({
  Eye: ({ size }) => <span data-testid="eye-icon" data-size={size}>Eye</span>,
  EyeOff: ({ size }) => <span data-testid="eye-off-icon" data-size={size}>EyeOff</span>,
}));

describe("ForgotPasswordNewPassword component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    localStorage.setItem("resetEmail", "test@example.com");
  });

  const renderForgotPasswordNewPassword = () => {
    return render(
      <MemoryRouter>
        <ForgotPasswordNewPassword />
      </MemoryRouter>
    );
  };

  test("renders new password form with required fields", () => {
    renderForgotPasswordNewPassword();

    expect(screen.getByText("Set New Password")).toBeInTheDocument();
    expect(screen.getByText("Enter your new password below")).toBeInTheDocument();
    expect(screen.getByText("New Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm new password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Password" })).toBeInTheDocument();
    expect(screen.getByText("← Back to Login")).toBeInTheDocument();
  });

  test("submits form with valid passwords and navigates to login on success", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password reset successfully" }),
    });

    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "NewPassword123!");
    await user.type(confirmPasswordInput, "NewPassword123!");
    await user.click(submitButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/forgot_password/reset",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          newPassword: "NewPassword123!",
        }),
      })
    );

    expect(screen.getByText("Password reset successfully!")).toBeInTheDocument();

    await waitFor(() => {
      expect(localStorage.getItem("resetEmail")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    }, { timeout: 2000 });
  });

  test("displays error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "NewPassword123!");
    await user.type(confirmPasswordInput, "DifferentPassword123!");
    await user.click(submitButton);

    expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("displays error when password validation fails", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "weak");
    await user.type(confirmPasswordInput, "weak");
    await user.click(submitButton);

    expect(screen.getByText(/Password must be at least 8 characters long/)).toBeInTheDocument();
    expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument();
    expect(screen.getByText(/Password must contain at least one special character/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("displays error message when password reset fails", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Password reset failed" }),
    });

    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "NewPassword123!");
    await user.type(confirmPasswordInput, "NewPassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password reset failed: Password reset failed")).toBeInTheDocument();
    });
  });

  test("toggles password visibility for new password field", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const toggleButtons = screen.getAllByText("Show");
    const firstToggleButton = toggleButtons[0];

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(firstToggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getAllByText("Hide")[0]).toBeInTheDocument();

    await user.click(screen.getAllByText("Hide")[0]);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getAllByText("Show")[0]).toBeInTheDocument();
  });

  test("toggles password visibility for confirm password field", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const toggleButtons = screen.getAllByText("Show");
    const confirmToggleButton = toggleButtons[1];

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    await user.click(confirmToggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    const hideButtons = screen.getAllByText("Hide");
    await user.click(hideButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("updates password requirement indicators as password meets criteria", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");

    await user.type(passwordInput, "weak");
    
    const requirements = screen.getAllByText(/✓/);
    requirements.forEach(req => {
      expect(req.closest('.requirement')).toHaveClass("unmet");
    });

    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPass123!");

    const updatedRequirements = screen.getAllByText(/✓/);
    updatedRequirements.forEach(req => {
      expect(req.closest('.requirement')).toHaveClass("met");
    });
  });

  test("navigates back to login when back link is clicked", async () => {
    renderForgotPasswordNewPassword();

    const backLink = screen.getByText("← Back to Login");
    
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/login");
    
    expect(backLink).toHaveAttribute("data-discover", "true");
  });

  test("validates password requirements correctly", async () => {
    const user = userEvent.setup();
    renderForgotPasswordNewPassword();

    const passwordInput = screen.getByPlaceholderText("Enter new password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm new password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    await user.type(passwordInput, "password123!");
    await user.type(confirmPasswordInput, "password123!");
    await user.click(submitButton);

    expect(screen.getByText(/Password must contain at least one uppercase letter/)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(passwordInput, "Password123");
    await user.type(confirmPasswordInput, "Password123");
    await user.click(submitButton);

    expect(screen.getByText(/Password must contain at least one special character/)).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(passwordInput, "Pass1!");
    await user.type(confirmPasswordInput, "Pass1!");
    await user.click(submitButton);

    expect(screen.getByText(/Password must be at least 8 characters long/)).toBeInTheDocument();
  });
});
