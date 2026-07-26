import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, addDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import RecipeForm from "./components/RecipeForm";
import RecipeCard from "./components/RecipeCard";
import MyRecipes from "./components/MyRecipes";
import ChefLoadingScreen from "./components/ChefLoadingScreen";
import chefHatSketch from "./assets/chef_hat_sketch.png";
import utensilsSketch from "./assets/utensils_sketch.png";
import dishSketch from "./assets/dish_sketch.png";

// Backend function URL
// Locally this runs on port 8080 via the functions-framework
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8080";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState("generator");

  // Recipe generation state
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatorView, setGeneratorView] = useState("form"); // "form" or "results"
  const [flagged, setFlagged] = useState(false);
  const [violations, setViolations] = useState([]);
  const [error, setError] = useState("");

  // Map of saved recipe titles -> Firestore doc ID to check favorite status quickly
  const [savedRecipesMap, setSavedRecipesMap] = useState({});

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Saved Recipes list for marking favorites on generated outputs
  useEffect(() => {
    if (!user) {
      setSavedRecipesMap({});
      return;
    }

    const q = collection(db, "users", user.uid, "savedRecipes");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const titleMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title) {
          titleMap[data.title.toLowerCase().trim()] = doc.id;
        }
      });
      setSavedRecipesMap(titleMap);
    });

    return () => unsubscribe();
  }, [user]);

  // Request Recipe Generation from backend Cloud Function
  const handleGenerateRecipes = async (ingredients, constraints, dishName = "") => {
    setLoading(true);
    setError("");
    setFlagged(false);
    setViolations([]);
    setRecipes([]);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ingredients, constraints, dishName })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const baseErr = errorData.error || `Server responded with status ${response.status}`;
        const detailErr = errorData.details ? ` Details: ${errorData.details}` : "";
        throw new Error(`${baseErr}${detailErr}`);
      }

      const data = await response.json();
      setRecipes(data.recipes);
      setFlagged(data.flagged);
      setViolations(data.violations || []);

      if (data.recipes.length === 0) {
        setError("Could not generate any recipe matches with the ingredients provided under those constraints. Try adding more ingredients.");
      } else {
        setGeneratorView("results");
      }
    } catch (err) {
      console.error("Recipe generation error:", err);
      setError(err.message || "Something went wrong. Please check that your local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Save/Unsave recipes to/from Firestore
  const handleToggleFavorite = async (recipe) => {
    if (!user) {
      // Force Login/Signup
      setShowAuthModal(true);
      return;
    }

    const recipeKey = recipe.title.toLowerCase().trim();
    const savedDocId = savedRecipesMap[recipeKey];

    try {
      if (savedDocId) {
        // Already favorited, unsave it
        await deleteDoc(doc(db, "users", user.uid, "savedRecipes", savedDocId));
      } else {
        // Save new favorite to Firestore
        await addDoc(collection(db, "users", user.uid, "savedRecipes"), {
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          calories: recipe.calories || null,
          prepTime: recipe.prepTime || "",
          substitutions: recipe.substitutions || [],
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Could not update favorites. Make sure you are logged in and security rules are applied.");
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container" style={{ marginTop: "10rem" }}>
        <div className="spinner"></div>
        <p className="loading-text">Starting AI Recipe Lab...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <header className="header">
          <div className="header-content" style={{ justifyContent: "center" }}>
            <span className="logo" style={{ cursor: "default" }}>
              <span>🍳</span> AI Recipe Lab
            </span>
          </div>
        </header>

        <main className="main-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "75vh", padding: "2rem" }}>
          <div className="welcome-layout" style={{ display: "flex", gap: "4rem", alignItems: "center", maxWidth: "920px", width: "100%", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div className="hero-badge">🍽️ Welcome Chef</div>
              <h1 style={{ fontSize: "2.75rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.75rem", letterSpacing: "-0.02em", lineHeight: "1.2" }}>AI-Powered Recipe Lab</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.55", marginBottom: "1.5rem" }}>
                Welcome to your kitchen workspace. Sign in to enter the lab, unlock recipe ideas, and store your culinary creations.
              </p>
              <img 
                src={chefHatSketch} 
                alt="Chef hat and spoons logo sketch" 
                style={{ width: "100%", maxWidth: "340px", mixBlendMode: "multiply", filter: "contrast(1.05)", marginTop: "1rem" }}
              />
            </div>
            <div style={{ flex: "1 1 360px", minWidth: "300px", display: "flex", justifyContent: "center" }}>
              <AuthForm isEmbed={true} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        setShowAuthModal={setShowAuthModal}
      />

      <main className="main-content">
        {activeTab === "generator" ? (
          loading ? (
            <ChefLoadingScreen />
          ) : generatorView === "form" ? (
            <div className="welcome-layout" style={{ display: "flex", gap: "4rem", alignItems: "flex-start", maxWidth: "980px", width: "100%", flexWrap: "wrap", margin: "0 auto" }}>
              <div style={{ flex: "1 1 380px", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div className="hero-badge">🍽️ Virtual Prep Space</div>
                <h1 style={{ fontSize: "2.75rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.75rem", letterSpacing: "-0.02em", lineHeight: "1.2" }}>What's in your Kitchen?</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.55", marginBottom: "1.5rem" }}>
                  Add your ingredients and list any food preferences. Our AI chef will generate clean, safe, custom recipes just for you.
                </p>
                <img 
                  src={utensilsSketch} 
                  alt="Kitchen utensils prep sketch" 
                  style={{ width: "100%", maxWidth: "340px", mixBlendMode: "multiply", filter: "contrast(1.05)", marginTop: "1rem" }}
                />
              </div>
              <div style={{ flex: "1 2 480px", minWidth: "320px" }}>
                <RecipeForm onGenerate={handleGenerateRecipes} loading={loading} />
                
                {error && (
                  <div className="warning-banner" style={{ marginTop: "2rem" }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="results-view" style={{ animation: "slideUp 0.4s ease-out" }}>
              <div className="welcome-layout" style={{ display: "flex", gap: "4rem", alignItems: "center", maxWidth: "980px", width: "100%", flexWrap: "wrap", marginBottom: "3rem", margin: "0 auto" }}>
                <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
                  <div className="hero-badge">✨ Dish is Served</div>
                  <h1 style={{ fontSize: "2.75rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.75rem", letterSpacing: "-0.02em", lineHeight: "1.2" }}>Your Curated Recipes</h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: "1.55", marginBottom: "2rem" }}>
                    Here are the customized meals prepared for you. Feel free to save them to your favorites or return to prep a different dish.
                  </p>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setGeneratorView("form"); setRecipes([]); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span>🥣</span> Return to Kitchen
                  </button>
                </div>
                <div style={{ flex: "1 1 360px", minWidth: "300px", display: "flex", justifyContent: "center" }}>
                  <img 
                    src={dishSketch} 
                    alt="Served gourmet dish sketch" 
                    style={{ width: "100%", maxWidth: "340px", mixBlendMode: "multiply", filter: "contrast(1.05)" }}
                  />
                </div>
              </div>

              {flagged && violations.length > 0 && (
                <div className="warning-banner" style={{ marginBottom: "2.5rem", borderColor: "rgba(245, 158, 11, 0.4)", color: "var(--warning)", backgroundColor: "rgba(245, 158, 11, 0.05)", maxWidth: "980px", margin: "0 auto 2.5rem auto" }}>
                  <span>⚠️</span>
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Allergen Warning/Constraint Flags:</strong>
                    <ul style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.9rem" }}>
                      {violations.map((v, idx) => <li key={idx}>{v}</li>)}
                    </ul>
                    <span style={{ display: "block", fontSize: "0.8rem", marginTop: "0.5rem", opacity: 0.8 }}>Please double check the ingredients before cooking.</span>
                  </div>
                </div>
              )}

              <section className="recipes-grid" style={{ marginTop: 0 }}>
                {recipes.map((recipe, idx) => {
                  const isSaved = !!savedRecipesMap[recipe.title.toLowerCase().trim()];
                  return (
                    <RecipeCard 
                      key={idx} 
                      recipe={recipe} 
                      isSaved={isSaved} 
                      onToggleFavorite={handleToggleFavorite}
                    />
                  );
                })}
              </section>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { setGeneratorView("form"); setRecipes([]); }}
                  style={{ padding: "1rem 2.5rem" }}
                >
                  <span>🍳</span> Cook Something Else
                </button>
              </div>
            </div>
          )
        ) : (
          <MyRecipes user={user} />
        )}
      </main>

      {showAuthModal && <AuthForm onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
