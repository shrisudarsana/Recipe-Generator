/**
 * Programmatic validator for recipe ingredient constraints.
 * It checks the generated recipes against common allergens and dietary restrictions.
 */

const DIETARY_BLACKLISTS = {
  vegan: [
    "meat", "beef", "pork", "chicken", "turkey", "lamb", "duck", "bacon", "ham",
    "fish", "salmon", "tuna", "cod", "shrimp", "prawn", "crab", "lobster", "clam",
    "mussel", "oyster", "scallop", "anchovy", "sardine", "gelatin", "lard", "tallow",
    "milk", "butter", "cheese", "cream", "yogurt", "whey", "ghee", "casein",
    "egg", "mayo", "aioli", "honey"
  ],
  vegetarian: [
    "meat", "beef", "pork", "chicken", "turkey", "lamb", "duck", "bacon", "ham",
    "fish", "salmon", "tuna", "cod", "shrimp", "prawn", "crab", "lobster", "clam",
    "mussel", "oyster", "scallop", "anchovy", "sardine", "gelatin", "lard", "tallow"
  ]
};

const ALLERGEN_BLACKLISTS = {
  dairy: ["milk", "butter", "cheese", "cream", "yogurt", "whey", "ghee", "casein"],
  peanuts: ["peanut"],
  "tree nuts": ["almond", "walnut", "pecan", "cashew", "pistachio", "macadamia", "hazelnut", "brazil nut"],
  eggs: ["egg", "mayo", "aioli", "meringue"],
  gluten: ["wheat", "flour", "barley", "rye", "semolina", "spelt", "soy sauce", "pasta", "bread", "noodle"],
  soy: ["soy", "tofu", "tempeh", "edamame", "miso"],
  fish: ["fish", "salmon", "tuna", "cod", "halibut", "tilapia", "anchovy", "sardine", "snapper", "trout", "haddock"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
  sesame: ["sesame", "tahini"]
};

// Safe prefixes that exempt a word from being categorized as an allergen
const SAFE_EXEMPTIONS = [
  "coconut", "almond", "soy", "oat", "rice", "gluten-free", "vegan", "dairy-free",
  "plant-based", "flax", "sunflower", "tapioca", "chickpea", "potato", "corn"
];

/**
 * Checks if a word is matched but should be exempted (e.g. "almond milk" for dairy, "gluten-free flour" for gluten).
 */
function isExempted(ingredientText, matchedKeyword, constraint) {
  const text = ingredientText.toLowerCase();
  
  // If the matched keyword is 'milk' and it is preceded by almond/coconut/soy/oat/rice
  if (matchedKeyword === "milk" || matchedKeyword === "butter" || matchedKeyword === "cheese" || matchedKeyword === "cream" || matchedKeyword === "yogurt") {
    for (const prefix of ["coconut", "almond", "soy", "oat", "rice", "cashew", "vegan", "dairy-free", "plant-based"]) {
      if (text.includes(`${prefix} ${matchedKeyword}`) || text.includes(`${prefix}-${matchedKeyword}`)) {
        return true;
      }
    }
  }

  // If the matched keyword is 'flour' or 'bread' or 'pasta' or 'noodle'
  if (["flour", "bread", "pasta", "noodle", "soy sauce"].includes(matchedKeyword)) {
    for (const prefix of ["gluten-free", "rice", "coconut", "almond", "tapioca", "chickpea", "potato", "corn", "oat"]) {
      if (text.includes(`${prefix} ${matchedKeyword}`) || text.includes(`${prefix}-${matchedKeyword}`)) {
        return true;
      }
    }
  }

  // For egg exemptions (e.g. eggplant, flax egg)
  if (matchedKeyword === "egg") {
    if (text.includes("eggplant") || text.includes("flax egg") || text.includes("chia egg") || text.includes("vegan egg")) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a list of recipes against dietary restrictions and allergies.
 * Returns { isValid: boolean, violations: string[] }
 */
export function validateRecipes(recipes, constraints) {
  const { dietaryRestrictions = [], allergies = [] } = constraints;
  const violations = [];

  if (!recipes || !Array.isArray(recipes)) {
    return { isValid: false, violations: ["Invalid recipes format received from Gemini."] };
  }

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const recipeName = recipe.title || `Recipe #${i + 1}`;
    
    // Check all ingredients in the recipe
    const ingredientList = recipe.ingredients || [];
    for (const ingredient of ingredientList) {
      const lowerIng = ingredient.toLowerCase();

      // Check dietary restrictions
      for (const diet of dietaryRestrictions) {
        const blacklist = DIETARY_BLACKLISTS[diet.toLowerCase()];
        if (blacklist) {
          for (const forbidden of blacklist) {
            if (lowerIng.includes(forbidden)) {
              if (!isExempted(ingredient, forbidden, diet)) {
                violations.push(`"${recipeName}" includes "${ingredient}", which violates the "${diet}" restriction (detected forbidden keyword: "${forbidden}").`);
              }
            }
          }
        }
      }

      // Check allergies
      for (const allergy of allergies) {
        const blacklist = ALLERGEN_BLACKLISTS[allergy.toLowerCase()];
        if (blacklist) {
          for (const forbidden of blacklist) {
            if (lowerIng.includes(forbidden)) {
              if (!isExempted(ingredient, forbidden, allergy)) {
                violations.push(`"${recipeName}" includes "${ingredient}", which violates the "${allergy}" allergy constraint (detected forbidden keyword: "${forbidden}").`);
              }
            }
          }
        }
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}
