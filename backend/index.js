import functions from "@google-cloud/functions-framework";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import { buildRecipePrompt, recipeResponseSchema } from "./promptTemplate.js";
import { validateRecipes } from "./validator.js";

// Load local environment variables (useful for local testing)
dotenv.config();

const corsHandler = cors({ origin: true });

// Initialize Gemini API Client
// Note: GEMINI_API_KEY is retrieved from environment variables
const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
  // Wrap with CORS middleware
  corsHandler(req, res, async () => {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed. Use POST." });
    }

    // Check for API key
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set.");
      return res.status(500).json({
        error: "Configuration Error: Backend is missing the Generative AI API Key."
      });
    }

    const { ingredients, constraints, dishName } = req.body;

    // Validate request body
    if (!dishName) {
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "Please provide either a dishName or a non-empty ingredients array." });
      }
    } else {
      if (typeof dishName !== "string" || dishName.trim().length === 0) {
        return res.status(400).json({ error: "Invalid dishName in request body." });
      }
    }

    const parsedConstraints = constraints || {};

    try {
      if (dishName) {
        console.log(`Generating recipes for specific dish: ${dishName}`);
      } else {
        console.log(`Generating recipes for ingredients: ${ingredients.join(", ")}`);
      }
      console.log("Constraints:", JSON.stringify(parsedConstraints));

      const genAI = new GoogleGenerativeAI(apiKey);
      const promptText = buildRecipePrompt(ingredients || [], parsedConstraints, dishName);

      let modelInstance;
      let result;
      let textResponse = "";

      try {
        console.log("Attempting generation with gemini-3.5-flash...");
        modelInstance = genAI.getGenerativeModel({
          model: "gemini-3.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: recipeResponseSchema,
          },
        });
        result = await modelInstance.generateContent(promptText);
        textResponse = result.response.text();
      } catch (err) {
        console.warn("gemini-3.5-flash failed or was unavailable. Retrying with gemini-1.5-flash...", err.message);
        modelInstance = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: recipeResponseSchema,
          },
        });
        result = await modelInstance.generateContent(promptText);
        textResponse = result.response.text();
      }
      
      let parsedData;
      try {
        parsedData = JSON.parse(textResponse);
      } catch (parseErr) {
        console.error("Failed to parse Gemini output as JSON. Raw response:", textResponse);
        return res.status(502).json({
          error: "Failed to parse generated response. Please try again.",
          raw: textResponse
        });
      }

      let recipes = parsedData.recipes || [];

      // Validate constraints programmatically
      let validationResult = validateRecipes(recipes, parsedConstraints);

      if (!validationResult.isValid) {
        console.warn("Constraint validation failed. Retrying with corrections. Violations:", validationResult.violations);

        // Attempt a retry by providing the error details back to the model
        const retryPrompt = `${promptText}

WARNING: The previous generated recipes failed constraint validation with the following issues:
${validationResult.violations.map(v => `- ${v}`).join("\n")}

Please re-generate the recipes and ensure they STRICTLY comply with the constraints and contain NONE of the forbidden ingredients.`;

        const retryResult = await modelInstance.generateContent(retryPrompt);
        const retryText = retryResult.response.text();
        
        try {
          const retryData = JSON.parse(retryText);
          recipes = retryData.recipes || [];
          // Validate again
          validationResult = validateRecipes(recipes, parsedConstraints);
        } catch (retryParseErr) {
          console.error("Failed to parse retry output. Raw response:", retryText);
          // Fall back to original recipes with a warning
        }
      }

      // Return response
      return res.status(200).json({
        recipes,
        flagged: !validationResult.isValid,
        violations: validationResult.isValid ? [] : validationResult.violations
      });

    } catch (error) {
      console.error("Error generating recipes:", error);
      return res.status(500).json({
        error: "An error occurred while generating recipes. Please check the backend logs.",
        details: error.message
      });
    }
  });
}

functions.http("generateRecipe", handler);
