import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";

export default function AuthForm({ onClose, isEmbed = false }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Please check your inbox.");
        setIsForgotPassword(false); // Return to sign-in screen
      } else if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        if (onClose) onClose();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (onClose) onClose();
      }
    } catch (err) {
      console.error(err);
      let cleanMsg = `Authentication failed: ${err.message}`;
      if (err.code === "auth/email-already-in-use") {
        cleanMsg = "This email is already in use.";
      } else if (err.code === "auth/weak-password") {
        cleanMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        cleanMsg = "Invalid email or password.";
      } else if (err.code === "auth/user-not-found") {
        cleanMsg = isForgotPassword ? "No account found with this email address." : "Invalid email or password.";
      } else if (err.code === "auth/missing-email") {
        cleanMsg = "Please enter your email address.";
      } else if (err.code === "auth/invalid-email") {
        cleanMsg = "Please enter a valid email address.";
      }
      setError(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google Sign-In failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formCardContent = (
    <div className="form-card" style={{ maxWidth: "440px", width: "100%", padding: "2.5rem", position: "relative" }}>
      {!isEmbed && onClose && (
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: "1.5rem",
            cursor: "pointer"
          }}
        >
          &times;
        </button>
      )}

      {isForgotPassword ? (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>Reset Password</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.4" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      ) : (
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${!isSignUp ? "active" : ""}`}
            onClick={() => { setIsSignUp(false); setIsForgotPassword(false); setError(""); setMessage(""); }}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${isSignUp ? "active" : ""}`}
            onClick={() => { setIsSignUp(true); setIsForgotPassword(false); setError(""); setMessage(""); }}
          >
            Sign Up
          </div>
        </div>
      )}

      {error && (
        <div className="warning-banner" style={{ fontSize: "0.875rem", padding: "0.75rem", marginBottom: "1.25rem" }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div style={{ 
          fontSize: "0.875rem", 
          padding: "0.75rem", 
          marginBottom: "1.25rem",
          backgroundColor: "#f0fdf4",
          color: "#166534",
          border: "1px solid #bbf7d0",
          borderRadius: "0.5rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center"
        }}>
          <span>✅</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {!isForgotPassword && (
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              {!isSignUp && (
                <span 
                  onClick={() => { setIsForgotPassword(true); setError(""); setMessage(""); }}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--brand-primary, #ea580c)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    marginBottom: "0.25rem"
                  }}
                >
                  Forgot Password?
                </span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-input" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.25rem"
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }} disabled={loading}>
          {loading ? (
            <div className="spinner" style={{ width: "18px", height: "18px" }}></div>
          ) : (
            isForgotPassword ? "Send Reset Link" : (isSignUp ? "Create Account" : "Sign In")
          )}
        </button>
      </form>

      {isForgotPassword && (
        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <span 
            onClick={() => { setIsForgotPassword(false); setError(""); }}
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Back to Sign In
          </span>
        </div>
      )}

      {!isForgotPassword && (
        <>
          <div className="auth-divider">or</div>

          <button onClick={handleGoogleSignIn} className="btn btn-google" disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </>
      )}
    </div>
  );

  if (isEmbed) {
    return formCardContent;
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem"
    }}>
      {formCardContent}
    </div>
  );
}
