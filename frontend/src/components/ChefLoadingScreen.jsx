import React, { useState, useEffect } from "react";
import chefMixing from "../assets/chef_mixing_sketch.png";
import chefChopping from "../assets/chef_chopping_sketch.png";
import chefFrying from "../assets/chef_frying_sketch.png";
import chefSalting from "../assets/chef_salting_sketch.png";
import chefPlating from "../assets/chef_plating_sketch.png";

const COOKING_STEPS = [
  {
    title: "AI Chef is reviewing ingredients...",
    subtitle: "Taking a look at your pantry items and reading the constraints...",
    image: chefMixing,
    animClass: "anim-sketch-wiggle"
  },
  {
    title: "AI Chef is mixing things in a bowl...",
    subtitle: "Folding in the ingredients and whisking flavours together...",
    image: chefMixing,
    animClass: "anim-sketch-wiggle"
  },
  {
    title: "AI Chef is chopping vegetables...",
    subtitle: "Dicing, slicing, and preparing the fresh produce...",
    image: chefChopping,
    animClass: "anim-sketch-wiggle"
  },
  {
    title: "AI Chef is sizzling the pan...",
    subtitle: "Sautéing garlic, checking temperatures, and heating up the skillet...",
    image: chefFrying,
    animClass: "anim-sketch-shake"
  },
  {
    title: "AI Chef is adding a pinch of salt...",
    subtitle: "Checking allergen constraints and balancing the spices...",
    image: chefSalting,
    animClass: "anim-sketch-wiggle"
  },
  {
    title: "AI Chef is plating your meal...",
    subtitle: "Almost ready! Serving the hot recommendations onto the table...",
    image: chefPlating,
    animClass: "anim-sketch-wiggle"
  }
];

export default function ChefLoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prevIndex) => (prevIndex + 1) % COOKING_STEPS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentStep = COOKING_STEPS[stepIndex];

  return (
    <div className="loading-container" style={{ minHeight: "50vh", justifyContent: "center" }}>
      <div className="chef-loading-card">
        {/* Render the sketched character scene */}
        <div key={stepIndex} style={{ margin: "1rem 0", display: "flex", justifyContent: "center" }}>
          <img 
            src={currentStep.image} 
            alt={currentStep.title} 
            className={currentStep.animClass}
            style={{ 
              width: "100%", 
              maxWidth: "240px", 
              mixBlendMode: "multiply", 
              filter: "contrast(1.05)",
              transition: "transform 0.3s ease" 
            }}
          />
        </div>
        
        <div className="spinner" style={{ margin: "1.5rem auto" }}></div>
        <h3 style={{ fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
          {currentStep.title}
        </h3>
        <p className="loading-text" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", minHeight: "3rem", lineHeight: "1.4" }}>
          {currentStep.subtitle}
        </p>
      </div>
    </div>
  );
}
