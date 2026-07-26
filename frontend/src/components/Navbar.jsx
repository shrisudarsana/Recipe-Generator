import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Navbar({ activeTab, setActiveTab, user, setShowAuthModal }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveTab("generator");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <a href="#" className="logo" onClick={() => setActiveTab("generator")}>
          <span>🍳</span> AI Recipe Lab
        </a>
        
        <nav className="nav-links">
          <span 
            className={`nav-link ${activeTab === "generator" ? "active" : ""}`}
            onClick={() => setActiveTab("generator")}
          >
            Generator
          </span>
          
          {user && (
            <span 
              className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              My Recipes
            </span>
          )}
          
          {user ? (
            <div className="user-badge">
              <span className="user-email" title={user.email}>{user.email}</span>
              <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
