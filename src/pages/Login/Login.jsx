import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

let fallbackUrl = "http://localhost:5000";
if (typeof window !== "undefined" && window.location.hostname.includes("onrender.com")) {
  fallbackUrl = "https://sentinelcore-9hxu.onrender.com";
}
const API_URL = (import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // MFA simulation states
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [tempAuthData, setTempAuthData] = useState(null);

  // Clear session data if visiting login page afresh (but keep settings like mfa_enabled and existing sessions)
  useEffect(() => {
    const mfa = localStorage.getItem("mfa_enabled");
    const sessions = localStorage.getItem("sessions");
    localStorage.clear();
    if (mfa) localStorage.setItem("mfa_enabled", mfa);
    if (sessions) localStorage.setItem("sessions", sessions);
  }, []);

  const validate = (field, value) => {
    let tempErrors = { ...errors };

    if (field === "email") {
      if (!value) {
        tempErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        tempErrors.email = "Invalid email format";
      } else {
        delete tempErrors.email;
      }
    }

    if (field === "password") {
      if (!value) {
        tempErrors.password = "Password is required";
      } else {
        delete tempErrors.password;
      }
    }

    setErrors(tempErrors);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    validate("email", val);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    validate("password", val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    // Final validation check
    const tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = "Invalid email format";
    if (!password) tempErrors.password = "Password is required";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const isMfaEnabled = localStorage.getItem("mfa_enabled") === "true";
        if (isMfaEnabled) {
          // Store data temporarily and transition to MFA screen
          setTempAuthData(data);
          setIsMfaStep(true);
        } else {
          completeLogin(data);
        }
      } else {
        setApiError(data.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setApiError("Network error. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = (e) => {
    e.preventDefault();
    setOtpError("");

    // Mock verification: any code works, but we tell the user to use '123456' for testing
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    // Log the successful MFA authentication
    const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    auditLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      user: tempAuthData?.username || "Admin",
      action: "Authenticated with multi-factor authentication (MFA)."
    });
    localStorage.setItem("audit_logs", JSON.stringify(auditLogs));

    completeLogin(tempAuthData);
  };

  const completeLogin = (authData) => {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("username", authData.username);
    localStorage.setItem("role", authData.role);

    // Session tracking: register a new active session
    let sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    
    // Add current session details
    const newSession = {
      id: Math.random().toString(36).substring(2, 9),
      device: navigator.userAgent.includes("Windows") ? "Windows PC · Chrome" : "Mobile Browser",
      ip: "192.168.1.100", // simulated IP
      loginTime: new Date().toLocaleString(),
      isCurrent: true
    };

    // Mark previous sessions as not current
    sessions = sessions.map(s => ({ ...s, isCurrent: false }));
    sessions.unshift(newSession);
    localStorage.setItem("sessions", JSON.stringify(sessions));

    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: "middle", marginRight: "10px"}}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          SentinelCore
        </h1>
        <h4>Security Operations Dashboard</h4>

        {apiError && <div className="api-error">{apiError}</div>}
        {otpError && <div className="api-error">{otpError}</div>}

        {!isMfaStep ? (
          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter Email Address"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter Password"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit}>
            <p className="mfa-info-text">
              Multi-Factor Authentication (MFA) is enabled for this system. Please enter the 6-digit verification code.
            </p>
            
            <label style={{ textAlign: "center", marginBottom: "15px" }}>Verification Code</label>
            <input
              type="text"
              maxLength="6"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              style={{ textAlign: "center", fontSize: "20px", letterSpacing: "8px", fontWeight: "bold" }}
            />
            
            <button type="submit">Verify & Login</button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setIsMfaStep(false)}
              style={{ background: "transparent", color: "var(--text-muted)", marginTop: "8px", border: "none" }}
            >
              Cancel
            </button>
          </form>
        )}

        {!isMfaStep && (
          <h5
            onClick={() => navigate("/signup")}
            style={{
              textAlign: "center",
              color: "var(--accent)",
              cursor: "pointer",
              marginTop: "20px",
              fontWeight: "600"
            }}
          >
            Create New Account
          </h5>
        )}
      </div>
    </div>
  );
}

export default Login;