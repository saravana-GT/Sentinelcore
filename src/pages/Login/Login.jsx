import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear token if visiting login page
  useEffect(() => {
    localStorage.clear();
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        navigate("/dashboard");
      } else {
        setApiError(data.error || "Login failed. Please check credentials.");
      }
    } catch (err) {
      setApiError("Network error. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🛡 SentinelCore</h1>
        <h4>Intelligent Security Monitoring System</h4>

        {apiError && <div className="api-error">{apiError}</div>}

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

        <h5
          onClick={() => navigate("/signup")}
          style={{
            textAlign: "center",
            color: "blue",
            cursor: "pointer",
            marginTop: "15px"
          }}
        >
          Sign Up
        </h5>
      </div>
    </div>
  );
}

export default Login;