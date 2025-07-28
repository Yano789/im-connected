import { useRef, useEffect, useState } from "react";
import SignUpPeople from "../assets/SignUpPeople.png";
import "./Authentication.css";
import { useNavigate } from "react-router-dom";

function Auth() {
    const inputsRef = useRef([]);
    const [status, setStatus] = useState(null);
    const email = localStorage.getItem("email");
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            inputsRef.current[0]?.focus();
        }, 0);
    }, []);


    const handleInput = (e, Index) => {
        const value = e.target.value;
        if (/^\d$/.test(value)) {
            if (Index < 5) {
                inputsRef.current[Index + 1]?.focus();
            }
        }
        else {
            e.target.value = "";
        }
    };

    const handleKeyDown = (e, Index) => {
        if (e.key === "Backspace" && !e.target.value && Index > 0) {
            inputsRef.current[Index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/v1/email_verification/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    subject: "Email Verification",
                    message: "Verify your email with the code below."
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("OTP resent:", data);
                setStatus("OTP has been resent!");
            } else {
                console.error("Failed to resend OTP:", data);
                setStatus(`Resend failed: ${data.message || JSON.stringify(data)}`);
            }
        } catch (err) {
            console.error("Network error:", err);
            setStatus("Resend failed: Network error.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const code = inputsRef.current.map((input) => input.value).join("");
        try {
            const res = await fetch("http://localhost:5001/api/v1/otp/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, otp: code }),
            });

            const data = await res.json();

            if (res.ok) {
                console.log("Authenticated User:", data);
                navigate("/preferences");
            } else {
                console.log(code);
                setStatus(`Authentication failed: ${JSON.stringify(data)}`);
            }
        } catch (err) {
            console.error(err);
            setStatus("Authentication failed. Network error.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-title">Authentication</div>
                    <div className="auth-subtitle-container">
                        <div className="auth-subtitle">
                            We sent a 6 digit code to your email
                        </div>
                        <div className="auth-resend">
                            Didn't get the code? Click {' '}
                            <button className="auth-resend-link" onClick={handleResend}>here</button>
                            {' '}to resend.
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-code-inputs">
                        {[...Array(6)].map((_, i) => (
                            <input
                                key={i}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                className="auth-code-box"
                                ref={(el) => (inputsRef.current[i] = el)}
                                onInput={(e) => handleInput(e, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                            />
                        ))}
                    </div>

                    <button type="submit" className="auth-signup-button">
                        Sign Up
                    </button>
                </form>

                {status && <div className="status-message">{status}</div>}
            </div>

            <img src={SignUpPeople} alt="Sign Up Visual" className="signup-image" />
        </div>
    )
}

export default Auth;
