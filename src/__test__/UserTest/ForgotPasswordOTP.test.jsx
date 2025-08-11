import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPasswordOTP from "../../ForgotPassword/ForgotPasswordOTP";

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

describe("ForgotPasswordOTP component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    localStorage.setItem("resetEmail", "test@example.com");
  });

  const renderForgotPasswordOTP = () => {
    return render(
      <MemoryRouter>
        <ForgotPasswordOTP />
      </MemoryRouter>
    );
  };

  test("renders OTP verification form with required fields", () => {
    renderForgotPasswordOTP();

    expect(screen.getByText("Enter Reset Code")).toBeInTheDocument();
    expect(screen.getByText(/We sent a 6-digit code to/)).toBeInTheDocument();
    expect(screen.getByText(/Didn't get the code\? Click/)).toBeInTheDocument();
    expect(screen.getByText("here")).toBeInTheDocument();
    expect(screen.getByText(/to resend\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verify Code" })).toBeInTheDocument();
    expect(screen.getByText("← Back to Email")).toBeInTheDocument();
  });

  test("submits OTP and navigates to new password page on success", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Code verified successfully" }),
    });

    renderForgotPasswordOTP();

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByRole("button", { name: "Verify Code" });

    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");
    await user.type(inputs[4], "5");
    await user.type(inputs[5], "6");

    await user.click(submitButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/forgot_password/verify",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          otp: "123456",
        }),
      })
    );

    expect(screen.getByText("Code verified successfully!")).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/forgotpassword/newpassword");
  });

  test("displays error message when OTP verification fails", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid OTP" }),
    });

    renderForgotPasswordOTP();

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByRole("button", { name: "Verify Code" });

    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");
    await user.type(inputs[4], "5");
    await user.type(inputs[5], "6");

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Verification failed: Invalid OTP")).toBeInTheDocument();
    });
  });

  test("moves focus to next input when digit is entered", async () => {
    const user = userEvent.setup();
    renderForgotPasswordOTP();

    const inputs = screen.getAllByRole("textbox");
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    await user.type(firstInput, "1");

    expect(document.activeElement).toBe(secondInput);
  });

  test("handles backspace navigation between inputs", async () => {
    const user = userEvent.setup();
    renderForgotPasswordOTP();

    const inputs = screen.getAllByRole("textbox");
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    await user.type(firstInput, "1");
    await user.type(secondInput, "2");

    await user.click(secondInput);
    await user.keyboard("{Backspace}");

    expect(document.activeElement).toStrictEqual(firstInput);
  });

  test("resends OTP when resend button is clicked", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Reset code resent successfully" }),
    });

    renderForgotPasswordOTP();

    const resendButton = screen.getByText("here");
    await user.click(resendButton);

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

    expect(screen.getByText("Reset code has been resent!")).toBeInTheDocument();
  });

  test("navigates back to email page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderForgotPasswordOTP();

    const backButton = screen.getByText("← Back to Email");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/forgotpassword");
  });
});
