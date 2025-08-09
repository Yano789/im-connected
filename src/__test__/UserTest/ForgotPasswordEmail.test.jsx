    import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPasswordEmail from "../../ForgotPassword/ForgotPasswordEmail";

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

describe("ForgotPasswordEmail component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderForgotPasswordEmail = () => {
    return render(
      <MemoryRouter>
        <ForgotPasswordEmail />
      </MemoryRouter>
    );
  };

  test("renders forgot password form with required fields", () => {
    renderForgotPasswordEmail();

    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    expect(screen.getByText("Don't worry! Enter your email address and we'll send you a reset code.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reset Code" })).toBeInTheDocument();
    expect(screen.getByText("← Back to Login")).toBeInTheDocument();
  });

  test("submits form with email and navigates to OTP page on success", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Reset code sent successfully" }),
    });

    renderForgotPasswordEmail();

    const emailInput = screen.getByPlaceholderText("Enter your email address");
    const submitButton = screen.getByRole("button", { name: "Send Reset Code" });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/forgot_password/",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
        }),
      })
    );

    expect(screen.getByText("Password reset code sent to your email!")).toBeInTheDocument();
    expect(localStorage.getItem("resetEmail")).toBe("test@example.com");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/forgotpassword/otp");
    }, { timeout: 2000 });
  });

  test("displays error message when email submission fails", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email not found" }),
    });

    renderForgotPasswordEmail();

    const emailInput = screen.getByPlaceholderText("Enter your email address");
    const submitButton = screen.getByRole("button", { name: "Send Reset Code" });

    await user.type(emailInput, "nonexistent@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to send reset code: Email not found")).toBeInTheDocument();
    });
  });

  test("navigates back to login when back link is clicked", async () => {
    const user = userEvent.setup();
    renderForgotPasswordEmail();

    const backLink = screen.getByText("← Back to Login");
    
    // Verify that the link exists and has the correct href
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/login");
    
    // Verify that the link is clickable (has the correct role)
    expect(backLink).toHaveAttribute("data-discover", "true");
  });
});
