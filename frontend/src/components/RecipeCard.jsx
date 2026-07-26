import React from "react";

export default function RecipeCard({ recipe, isSaved, onToggleFavorite, showFavoriteBtn = true }) {
  const { title, ingredients = [], instructions = [], calories, prepTime, substitutions = [] } = recipe;

  return (
    <article className="recipe-card">
      <div className="recipe-header">
        <div>
          <h2 className="recipe-title">{title}</h2>
          <div className="recipe-meta-badges">
            {calories && <span className="meta-badge meta-badge-calories">🔥 {calories} kcal</span>}
            {prepTime && <span className="meta-badge">⏱️ {prepTime}</span>}
          </div>
        </div>
        
        {showFavoriteBtn && (
          <button 
            className={`favorite-btn ${isSaved ? "saved" : ""}`}
            onClick={() => onToggleFavorite(recipe)}
            title={isSaved ? "Remove from Saved Recipes" : "Save to My Recipes"}
          >
            <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        )}
      </div>

      <div className="recipe-body">
        {substitutions.length > 0 && (
          <div className="substitutions-badge">
            <div className="substitutions-title">🔄 Ingredient Substitutions Made:</div>
            <ul style={{ paddingLeft: "1rem", margin: 0 }}>
              {substitutions.map((sub, idx) => (
                <li key={idx}>
                  Used <strong>{sub.substitutedWith}</strong> instead of <strong>{sub.original}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="recipe-section-title">
          <span>🥕</span> Ingredients
        </div>
        <ul className="recipe-ingredients-list">
          {ingredients.map((ing, idx) => {
            const isPantry = ing.toLowerCase().includes("(pantry)");
            const cleanedIng = ing.replace(/\(pantry\)/i, "").trim();
            return (
              <li key={idx} className={`recipe-ingredient-item ${isPantry ? "pantry-item" : ""}`}>
                {cleanedIng} {isPantry && <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>(Pantry)</span>}
              </li>
            );
          })}
        </ul>

        <div className="recipe-section-title">
          <span>🍳</span> Instructions
        </div>
        <div className="recipe-instructions">
          {instructions.map((step, idx) => (
            <div key={idx} className="instruction-step">
              <span className="step-number">{idx + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
