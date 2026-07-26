import React, { useState } from "react";

const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Non-Veg"];
const CUISINE_OPTIONS = ["Any", "Italian", "Mexican", "Asian", "Indian", "Mediterranean", "French", "American"];

export default function RecipeForm({ onGenerate, loading }) {
  const [step, setStep] = useState(1); // 1 = Ingredients, 2 = Constraints
  const [mode, setMode] = useState("ingredients"); // "ingredients" | "dish"
  const [dishName, setDishName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [dietary, setDietary] = useState([]);
  
  // Custom tag state for allergies
  const [allergies, setAllergies] = useState([]);
  const [allergyInputVal, setAllergyInputVal] = useState("");
  
  const [cuisine, setCuisine] = useState("Any");
  const [spiceLevel, setSpiceLevel] = useState("Any");
  const [calories, setCalories] = useState("");
  const [prepTime, setPrepTime] = useState("");

  const handleAddIngredient = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputVal.trim().replace(/,$/, "");
      if (val && !ingredients.includes(val)) {
        setIngredients([...ingredients, val]);
        setInputVal("");
      }
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddAllergy = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = allergyInputVal.trim().replace(/,$/, "");
      if (val && !allergies.includes(val)) {
        setAllergies([...allergies, val]);
        setAllergyInputVal("");
      }
    }
  };

  const handleRemoveAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const toggleDietary = (item) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter(d => d !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "ingredients" && ingredients.length === 0) return;
    if (mode === "dish" && !dishName.trim()) return;

    onGenerate(
      mode === "ingredients" ? ingredients : [],
      {
        dietaryRestrictions: dietary,
        allergies: allergies,
        cuisine: cuisine === "Any" ? "" : cuisine,
        spiceLevel: spiceLevel === "Any" ? "" : spiceLevel,
        calorieLimit: calories ? parseInt(calories) : null,
        prepTime: prepTime ? parseInt(prepTime) : null
      },
      mode === "dish" ? dishName.trim() : ""
    );
  };

  return (
    <div className="form-card">
      {/* Wizard Progress Indicator */}
      <div className="wizard-steps">
        <div className={`wizard-step ${step === 1 ? "active" : ""}`}>
          <span className="wizard-step-num">1</span>
          <span>Ingredients</span>
        </div>
        <div className="wizard-step-line"></div>
        <div className={`wizard-step ${step === 2 ? "active" : ""}`}>
          <span className="wizard-step-num">2</span>
          <span>Constraints</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="wizard-slide-content">
            {/* Mode selection tabs */}
            <div className="form-mode-tabs" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1.5px solid var(--border)", paddingBottom: "0.75rem" }}>
              <button
                type="button"
                className={`tab-btn ${mode === "ingredients" ? "active" : ""}`}
                onClick={() => setMode("ingredients")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-handwritten)",
                  fontSize: "1.25rem",
                  color: mode === "ingredients" ? "var(--primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  borderBottom: mode === "ingredients" ? "3px solid var(--primary)" : "none",
                  outline: "none"
                }}
              >
                🥣 Pantry Matcher
              </button>
              <button
                type="button"
                className={`tab-btn ${mode === "dish" ? "active" : ""}`}
                onClick={() => setMode("dish")}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-handwritten)",
                  fontSize: "1.25rem",
                  color: mode === "dish" ? "var(--primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  borderBottom: mode === "dish" ? "3px solid var(--primary)" : "none",
                  outline: "none"
                }}
              >
                🍳 Dish Explorer
              </button>
            </div>

            {mode === "ingredients" ? (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "1.1rem" }}>What ingredients do you have on hand?</label>
                <div className="tag-input-container">
                  {ingredients.map((ing, idx) => (
                    <span key={idx} className="tag">
                      {ing}
                      <button 
                        type="button" 
                        className="tag-remove" 
                        onClick={() => handleRemoveIngredient(idx)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    className="tag-input"
                    placeholder={ingredients.length === 0 ? "Type ingredients (e.g., pasta, garlic) and press Enter..." : "Add more..."}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleAddIngredient}
                  />
                </div>
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  Type an ingredient, then press <strong>Enter</strong> or comma <strong>(,)</strong> to add it.
                </p>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "1.1rem" }}>What specific dish do you want to make?</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ 
                    fontFamily: "var(--font-sans)", 
                    fontSize: "1.05rem", 
                    padding: "0.75rem 1rem", 
                    border: "2px solid #1c1917",
                    borderRadius: "15px 95px 12px 95px/95px 12px 95px 12px"
                  }}
                  placeholder="e.g. Sambar, White Sauce Pasta, Chicken Biryani..."
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                />
                <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  Type the name of any dish. We'll generate custom variations that fit all your constraints!
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setStep(2)}
                disabled={mode === "ingredients" ? ingredients.length === 0 : !dishName.trim()}
                style={{ padding: "0.875rem 2.5rem" }}
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-slide-content">
            <div className="form-group">
              <label className="form-label">Dietary Preferences</label>
              <div className="checkbox-grid">
                {DIETARY_OPTIONS.map((option) => (
                  <label key={option} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="checkbox-input"
                      checked={dietary.includes(option)}
                      onChange={() => toggleDietary(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Allergies / Excluded Ingredients</label>
              <div className="tag-input-container">
                {allergies.map((allergy, idx) => (
                  <span key={idx} className="tag" style={{ background: "#fff1f2", color: "var(--accent)", borderColor: "rgba(225, 29, 72, 0.2)" }}>
                    {allergy}
                    <button 
                      type="button" 
                      className="tag-remove" 
                      onClick={() => handleRemoveAllergy(idx)}
                      style={{ color: "var(--accent)" }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  className="tag-input"
                  placeholder={allergies.length === 0 ? "Type custom allergy (e.g., peanut, dairy, mushroom) and press Enter..." : "Add more..."}
                  value={allergyInputVal}
                  onChange={(e) => setAllergyInputVal(e.target.value)}
                  onKeyDown={handleAddAllergy}
                />
              </div>
              <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                Type an allergy or ingredient to exclude, then press <strong>Enter</strong> or comma <strong>(,)</strong> to add it.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cuisine Style</label>
                <select 
                  className="form-input" 
                  value={cuisine} 
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  {CUISINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Spice Level</label>
                <select 
                  className="form-input" 
                  value={spiceLevel} 
                  onChange={(e) => setSpiceLevel(e.target.value)}
                >
                  <option value="Any">Any Spice</option>
                  <option value="Mild">🌶️ Mild</option>
                  <option value="Medium">🌶️🌶️ Medium</option>
                  <option value="Hot">🌶️🌶️🌶️ Hot</option>
                  <option value="Extra Spicy">🌶️🌶️🌶️🌶️ Extra Spicy</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Calorie Limit (optional)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 600"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Max Prep Time (mins)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 45"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2rem" }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                ⬅ Back to Ingredients
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || (mode === "ingredients" ? ingredients.length === 0 : !dishName.trim())}
                style={{ padding: "0.875rem 2rem" }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "18px", height: "18px" }}></div>
                    Crafting Recipes...
                  </>
                ) : (
                  "🍳 Generate Recipes"
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
