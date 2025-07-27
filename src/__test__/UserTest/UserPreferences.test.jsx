import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import UserPreferences from "../../Preferences/UserPreferences";

global.fetch = vi.fn();

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("UserPreferences component", () => {
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
    localStorage.setItem("username", "testuser");
    
    global.alert = vi.fn();
  });

  const renderUserPreferences = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <UserPreferences />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("renders preferences form with all sections", () => {
    renderUserPreferences();

    expect(screen.getByText("Hi testuser!")).toBeInTheDocument();
    expect(screen.getByText("Preferred Language")).toBeInTheDocument();
    expect(screen.getByText("Text Size")).toBeInTheDocument();
    expect(screen.getByText("Content Mode")).toBeInTheDocument();
    expect(screen.getByText("Topics Interested In")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });

  test("allows selecting different languages", async () => {
    const user = userEvent.setup();
    renderUserPreferences();

    const chineseButton = screen.getByText("华文");
    await user.click(chineseButton);

    expect(chineseButton).toHaveClass("selected");
    expect(screen.getByText("English")).not.toHaveClass("selected");
  });

  test("allows selecting different text sizes", async () => {
    const user = userEvent.setup();
    renderUserPreferences();

    const smallButton = screen.getByText("Small");
    await user.click(smallButton);

    expect(smallButton).toHaveClass("selected");
    expect(screen.getByText("Medium")).not.toHaveClass("selected");
  });

  test("allows selecting different content modes", async () => {
    const user = userEvent.setup();
    renderUserPreferences();

    const defaultModeCard = screen.getByText("Default Mode").closest("div");
    await user.click(defaultModeCard);

    expect(defaultModeCard).toHaveClass("selected");
    expect(screen.getByText("Easy Reader Mode").closest("div")).not.toHaveClass("selected");
  });

  test("allows selecting up to 2 topics", async () => {
    const user = userEvent.setup();
    renderUserPreferences();

    const physicalDisabilityButton = screen.getByText("Physical Disability & Chronic Illness").closest("button");
    const mentalHealthButton = screen.getByText("Personal Mental Health").closest("button");

    await user.click(physicalDisabilityButton);
    expect(physicalDisabilityButton).toHaveClass("selected");

    await user.click(mentalHealthButton);
    expect(mentalHealthButton).toHaveClass("selected");
  });

  test("prevents selecting more than 2 topics", async () => {
    const user = userEvent.setup();
    renderUserPreferences();

    const physicalDisabilityButton = screen.getByText("Physical Disability & Chronic Illness").closest("button");
    const mentalHealthButton = screen.getByText("Personal Mental Health").closest("button");
    const financialButton = screen.getByText("Financial & Legal Help").closest("button");

    await user.click(physicalDisabilityButton);
    await user.click(mentalHealthButton);

    await user.click(financialButton);
    expect(financialButton).not.toHaveClass("selected");
    expect(financialButton).toHaveClass("disabled");
  });

  test("submits preferences and navigates to forum", async () => {
    const user = userEvent.setup();
    const mockUser = {
      _id: "123",
      username: "testuser",
      preferences: {
        language: "Chinese",
        textSize: "Big",
        contentMode: "Default",
        topics: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, user: mockUser }),
    });

    renderUserPreferences();

    await user.click(screen.getByText("华文")); 
    await user.click(screen.getByText("Big")); 
    await user.click(screen.getByText("Default Mode").closest("div")); 
    await user.click(screen.getByText("Physical Disability & Chronic Illness").closest("button"));
    await user.click(screen.getByText("Personal Mental Health").closest("button"));

    const continueButton = screen.getByRole("button", { name: "Continue" });
    await user.click(continueButton);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/v1/user/preferences",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: "testuser",
          language: "Chinese",
          textSize: "Big",
          contentMode: "Default",
          topics: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
        }),
      })
    );

    expect(localStorage.getItem("preferences")).toBe(
      JSON.stringify({
        language: "Chinese",
        textSize: "Big",
        contentMode: "Default",
        topics: ["Physical Disability & Chronic Illness", "Personal Mental Health"],
      })
    );

    expect(localStorage.getItem("canVerifyEmail")).toBeNull();
    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockNavigate).toHaveBeenCalledWith("/forum");
  });
}); 