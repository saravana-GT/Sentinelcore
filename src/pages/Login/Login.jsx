import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {

    navigate("/dashboard");

  };

  return (

    <div className="login-container">

      <div className="login-card">

        <h1>🛡 SentinelCore</h1>

        <h4>Intelligent Security Monitoring System</h4>

        <label>Username</label>

        <input
          type="text"
          placeholder="Enter Username"
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button onClick={handleLogin}>
          Login
        </button>
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