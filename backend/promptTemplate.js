import { FunctionDeclarationSchemaType as SchemaType } from "@google/generative-ai";

/**
 * Builds the Gemini prompt for recipe generation based on ingredients and constraints.
 */
export function buildRecipePrompt(ingredients, constraints, dishName = "") {
  const { dietaryRestrictions = [], allergies = [], cuisine = "", calorieLimit = null, prepTime = null, spiceLevel = "" } = constraints;

  let constraintClause = "";
  if (dietaryRestrictions.length > 0) {
    constraintClause += `- Dietary Restrictions (MUST satisfy all): ${dietaryRestrictions.join(", ")}\n`;
  }
  if (allergies.length > 0) {
    constraintClause += `- Allergies / Excluded Ingredients (MUST NOT contain any of these, even in traces): ${allergies.join(", ")}\n`;
  }
  if (cuisine) {
    constraintClause += `- Cuisine Preference: ${cuisine}\n`;
  }
  if (calorieLimit) {
    constraintClause += `- Calorie Limit: Maximum ${calorieLimit} calories per serving\n`;
  }
  if (prepTime) {
    constraintClause += `- Prep + Cook Time Limit: Maximum ${prepTime} minutes total\n`;
  }
  if (spiceLevel) {
    constraintClause += `- Spice Level Preference: The dishes MUST be prepared with a ${spiceLevel} spice profile.\n`;
  }

  if (dishName) {
    return `You are an expert chef and nutritionist. Your task is to generate exactly 1 high-quality, authentic, and safe recipe for the specific dish: **${dishName}**.

### Constraints:
${constraintClause || "- None"}

### Strict Rules:
1. **Single Recipe**: You MUST generate exactly 1 recipe inside the "recipes" array. Do not include multiple variations or options.
2. **Allergen / Diet Constraint**: Ensure that all ingredients are 100% compliant with the specified dietary restrictions and allergies. Double-check all ingredients and sub-ingredients (e.g. soy sauce contains gluten, butter is dairy) to ensure they do not violate any constraint.
3. **Substitutions**: If you make any ingredient substitutions to accommodate dietary or allergen constraints (e.g., using coconut milk instead of dairy cream for dairy allergies in a white sauce pasta), document it clearly in the 'substitutions' field.
4. **Pantry Labeling**: Clearly label any ingredients from common pantry list with "(Pantry)" in the recipe ingredients array, e.g., "1/2 tsp Salt (Pantry)".
5. **No Recipes**: If it is absolutely impossible to generate any recipe for the dish "${dishName}" that complies with these constraints, return an empty array for the "recipes" property in the JSON output.

Provide your response in JSON matching the requested schema.`;
  }

  const ingredientListStr = ingredients.map(i => `- ${i}`).join("\n");
  
  return `You are an expert chef and nutritionist. Your task is to generate 2 to 3 creative, delicious, and safe recipe options using ONLY the ingredients listed below, with exceptions for common pantry staples.

### User Ingredients:
${ingredientListStr}

### Common Pantry Staples allowed (use ONLY if necessary):
- Salt
- Black pepper
- Water
- Olive oil
- Vegetable oil
- Sugar
- Vinegar

### Constraints:
${constraintClause || "- None"}

### Strict Rules:
1. **Ingredient Constraint**: Do not use any ingredients that are not in the "User Ingredients" or "Common Pantry Staples" lists. If you need to make a substitution to meet a dietary restriction or allergy, do so ONLY using ingredients from the user's list or common staples.
2. **Allergen / Diet Constraint**: Ensure that all recipes are 100% compliant with the specified dietary restrictions and allergies. Double-check all ingredients and sub-ingredients (e.g. soy sauce contains gluten, butter is dairy) to ensure they do not violate any constraint.
3. **Substitutions**: If you make any ingredient substitution (e.g., coconut oil instead of butter, or gluten-free tamari instead of soy sauce), document it clearly in the 'substitutions' field.
4. **Pantry Labeling**: Clearly label any ingredients from the pantry list with "(Pantry)" in the recipe ingredients array, e.g., "1/2 tsp Salt (Pantry)".
5. **No Recipes**: If it is absolutely impossible to generate any recipe with the given ingredients under these constraints, return an empty array for the "recipes" property in the JSON output.

Provide your response in JSON matching the requested schema.`;
}

/**
 * Defines the JSON schema for Gemini structured output.
 */
export const recipeResponseSchema = {
  type: SchemaType.OBJECT,
  description: "JSON object containing 2 to 3 recipe suggestions.",
  properties: {
    recipes: {
      type: SchemaType.ARRAY,
      description: "List of 2 to 3 generated recipe options.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "The name of the recipe."
          },
          ingredients: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Detailed ingredient list (including quantities, e.g., '2 cups Flour', '1 tsp Salt (Pantry)')."
          },
          instructions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Step-by-step instructions for preparation and cooking."
          },
          calories: {
            type: SchemaType.INTEGER,
            description: "Estimated total calories per serving."
          },
          prepTime: {
            type: SchemaType.STRING,
            description: "Estimated preparation + cooking time, e.g., '25 mins'."
          },
          substitutions: {
            type: SchemaType.ARRAY,
            description: "List of substitutions made for constraints.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                original: {
                  type: SchemaType.STRING,
                  description: "The ingredient that was requested/expected but replaced."
                },
                substitutedWith: {
                  type: SchemaType.STRING,
                  description: "The ingredient that replaced the original."
                }
              },
              required: ["original", "substitutedWith"]
            }
          }
        },
        required: ["title", "ingredients", "instructions", "calories", "prepTime", "substitutions"]
      }
    }
  },
  required: ["recipes"]
};
