import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import Auth from "../../Authentication/Authentication";

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Authentication component", () => {
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
    localStorage.setItem("email", "test@example.com");
  });

  const renderAuth = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Auth />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("renders authentication form with OTP inputs", () => {
    renderAuth();

    expect(screen.getByText("Authentication")).toBeInTheDocument();
    expect(screen.getByText("We sent a 6 digit code to your email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  test("renders 6 OTP input boxes", () => {
    renderAuth();

    const otpInputs = screen.getAllByRole("textbox");
    expect(otpInputs).toHaveLength(6);
  });

  test("submits OTP and navigates to preferences on success", async () => {
    const user = userEvent.setup();
    const mockUser = {
      _id: "123",
      username: "testuser",
      email: "test@example.com",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@example.com", verified: true, user: mockUser }),
    });

    renderAuth();

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");
    await user.type(inputs[4], "5");
    await user.type(inputs[5], "6");

    await user.click(submitButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/email_verification/verify",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: "test@example.com",
          otp: "123456",
        }),
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/preferences");
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    }, { timeout: 200 });
  });

  test("displays error message when verification fails", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid OTP" }),
    });

    renderAuth();

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    await user.type(inputs[2], "3");
    await user.type(inputs[3], "4");
    await user.type(inputs[4], "5");
    await user.type(inputs[5], "6");

    await user.click(submitButton);

    expect(screen.getByText("Authentication failed: Invalid OTP")).toBeInTheDocument();
  });

  test("moves focus to next input when digit is entered", async () => {
    const user = userEvent.setup();
    renderAuth();

    const inputs = screen.getAllByRole("textbox");
    const firstInput = inputs[0];
    const secondInput = inputs[1];

    await user.type(firstInput, "1");

    expect(document.activeElement).toBe(secondInput);
  });

  test("resends OTP when resend button is clicked", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "OTP sent successfully" }),
    });

    renderAuth();

    const resendButton = screen.getByText("here");
    await user.click(resendButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/email_verification",
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

    expect(screen.getByText("OTP has been resent!")).toBeInTheDocument();
  });

  test("allows only numeric input in OTP fields", async () => {
    const user = userEvent.setup();
    renderAuth();

    const inputs = screen.getAllByRole("textbox");
    const firstInput = inputs[0];

    await user.type(firstInput, "1");
    expect(firstInput).toHaveValue("1");

    await user.type(firstInput, "a");
    expect(firstInput).toHaveValue("1");
  });
}); 