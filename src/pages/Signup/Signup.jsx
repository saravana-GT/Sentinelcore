import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          role: "OPERATOR" // Default role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setApiSuccess("Account created successfully! Redirecting to login...");
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
        <h2>Create Your Account</h2>
        <p>
          <b>Join the Intelligent Enterprise Security Monitoring Platform.</b>
        </p>
        <h1>WELCOME</h1>
      </div>

      <div className="signup-card">
        <h2>Create Account</h2>

        {apiError && <div className="api-error">{apiError}</div>}
        {apiSuccess && <div className="api-success">{apiSuccess}</div>}

        <form onSubmit={handleSignup}>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Username"
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}

          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Email Address"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Password"
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?
          <span onClick={() => navigate("/")}>
            <b>Login</b>
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;