import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success && result.user && result.access_token) {
      signIn(result.access_token, result.user);
      navigate("/chat", { replace: true });
      return;
    }

    setError(result.message || "Login failed. Please check your credentials.");
  }

return (
  <div className="auth-page">
    <div className="auth-card">

      <div className="logo-section">
        <h1>Jajja<span>AI</span></h1>
        <p>Sign in to continue chatting with your documents.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleLogin} className="auth-form">

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Sign In
        </button>

      </form>

      <div className="auth-footer">
        Don't have an account?
        <Link to="/register">
          Register
        </Link>
      </div>

    </div>
  </div>
);
}
export default Login;