import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/auth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = await register(name, email, password);

    if (result.success) {
      navigate("/login", { replace: true });
      return;
    }

    setError(result.message || "Registration failed. Please try again.");
  }

 return (
  <div className="auth-page">
    <div className="auth-card">

      <div className="logo-section">
        <h1>
          Jajja<span>AI</span>
        </h1>
        <p>Create your account to start chatting with your documents.</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleRegister} className="auth-form">

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          Create Account
        </button>

      </form>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login">
          Login
        </Link>
      </div>

    </div>
  </div>
);
}

export default Register;
