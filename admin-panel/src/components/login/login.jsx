import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase/auth";
import "./Login.css";
import { useNavigate } from "react-router-dom";


function Login() {
    const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(res.user);
        await signOut(auth);

        alert("Verification email sent. Verify before login.");
        setIsSignup(false);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);

        if (!res.user.emailVerified) {
          await signOut(auth);
          setError("Please verify your email before logging in.");
        } else {
           navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="title">Admin Panel</h1>
        <p className="subtitle">
          {isSignup ? "Create admin account" : "Login to continue"}
        </p>

        <div className="field">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="error-box">{error}</div>}

        <button
          className="primary-btn"
          onClick={handleEmailAuth}
          disabled={loading}
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>

        <p className="switch-text" onClick={() => setIsSignup(!isSignup)}>
          {isSignup
            ? "Already have an account? Login"
            : "New admin? Create account"}
        </p>
      </div>
    </div>
  );
}

export default Login;
