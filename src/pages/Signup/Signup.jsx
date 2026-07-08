import "./Signup.css";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

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
        <br></br>
        <input
          type="text"
          placeholder="Username"
        />
        <br></br>
        <input
          type="email"
          placeholder="Email Address"
        />
        <br></br>
        <input
          type="password"
          placeholder="Password"
        />
        <br></br>
        <button>
          Create Account
        </button>

        <p className="login-link">
         <h6>Already have an account?</h6> 
          <span onClick={() => navigate("/")}>
            <b>Login</b>
          </span>
        </p>

      </div>

    </div>
  );
}

export default Signup;