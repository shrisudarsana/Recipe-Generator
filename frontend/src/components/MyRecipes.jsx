import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import RecipeCard from "./RecipeCard";

export default function MyRecipes({ user }) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "savedRecipes"),
      orderBy("createdAt", "desc")
    );

    // Setup real-time listener to Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipes = [];
      snapshot.forEach((doc) => {
        recipes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setSavedRecipes(recipes);
      setLoading(false);
    }, (err) => {
      console.error("Error reading saved recipes:", err);
      setError(`Failed to load saved recipes: ${err.message} (Please make sure you have created the Firestore Database in your Firebase Console, and run 'firebase deploy --only firestore:rules' to deploy database rules).`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (recipe) => {
    if (!window.confirm(`Are you sure you want to remove "${recipe.title}" from your favorites?`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "users", user.uid, "savedRecipes", recipe.id));
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your saved recipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="warning-banner">
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="saved-recipes-header">
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>My Saved Recipes</h1>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {savedRecipes.length} {savedRecipes.length === 1 ? "recipe" : "recipes"} saved
        </span>
      </div>

      {savedRecipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No Saved Recipes Yet</h3>
          <p style={{ marginTop: "0.5rem" }}>
            Recipes you favorite during generation will appear here! Go back to the Generator tab to create some delicious meals.
          </p>
        </div>
      ) : (
        <div className="recipes-grid">
          {savedRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              isSaved={true} 
              onToggleFavorite={() => handleDelete(recipe)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
