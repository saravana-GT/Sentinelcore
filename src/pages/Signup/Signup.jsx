import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ANALYST"); // Default role
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = (field, value) => {
    let tempErrors = { ...errors };

    if (field === "username") {
      if (!value) {
        tempErrors.username = "Username is required";
      } else if (value.length < 3) {
        tempErrors.username = "Username must be at least 3 characters";
      } else {
        delete tempErrors.username;
      }
    }

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
      } else if (value.length < 6) {
        tempErrors.password = "Password must be at least 6 characters";
      } else {
        delete tempErrors.password;
      }
    }

    setErrors(tempErrors);
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    validate("username", val);
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

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");

    // Final validation check
    const tempErrors = {};
    if (!username) tempErrors.username = "Username is required";
    else if (username.length < 3) tempErrors.username = "Username must be at least 3 characters";

    if (!email) tempErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = "Invalid email format";

    if (!password) tempErrors.password = "Password is required";
    else if (password.length < 6) tempErrors.password = "Password must be at least 6 characters";

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setApiSuccess("Account created successfully! Redirecting to login...");
        
        // Track the registration action in the audit logs
        const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
        auditLogs.unshift({
          timestamp: new Date().toLocaleTimeString(),
          user: username,
          action: `User registered with role: ${role}`
        });
        localStorage.setItem("audit_logs", JSON.stringify(auditLogs));

        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setApiError(data.error || "Registration failed.");
      }
    } catch (err) {
      setApiError("Network error. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h1>🛡 SentinelCore</h1>
        <h2>Intelligent Security Monitoring Platform</h2>
        <p>
          Gain enterprise-wide visibility across all security operations, incident queues, threat intelligence IOCs, vulnerabilities and compliance status in one unified dashboard.
        </p>
      </div>

      <div className="signup-card">
        <h2>Create Account</h2>

        {apiError && <div className="api-error">{apiError}</div>}
        {apiSuccess && <div className="api-success">{apiSuccess}</div>}

        <form onSubmit={handleSignup}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter Username"
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}

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

          <label>Security Access Role</label>
          <select value={role} onChange={handleRoleChange}>
            <option value="ADMIN">Security Administrator (ADMIN)</option>
            <option value="ANALYST">Security Analyst (ANALYST)</option>
            <option value="VIEWER">Security Visitor (VIEWER - Read Only)</option>
          </select>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;