import React from "react";

export function ChefHatDoodle({ className, style }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      style={{ width: "100px", height: "100px", color: "#57534e", ...style }}
    >
      {/* Hand-drawn wobbly top curves of the chef hat */}
      <path d="M 28,68 Q 23,60 22,50 Q 21,38 30,32 Q 35,28 42,32 C 48,22 58,22 64,30 Q 75,34 76,46 Q 77,58 70,68 Z" />
      {/* Wobbly band lines */}
      <path d="M 27,68 Q 48,72 71,68" />
      <path d="M 28,74 Q 48,78 70,74" />
      <path d="M 27,68 L 28,74" />
      <path d="M 71,68 L 70,74" />
      {/* Faint sketch fold lines inside the hat */}
      <path d="M 36,46 C 36,40 40,36 44,46" strokeDasharray="1 1" strokeWidth="1.5" />
      <path d="M 50,44 C 50,36 54,36 56,44" strokeDasharray="1 1" strokeWidth="1.5" />
      <path d="M 62,48 C 62,42 65,40 66,48" strokeDasharray="1 1" strokeWidth="1.5" />
    </svg>
  );
}

export function UtensilsDoodle({ className, style }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      style={{ width: "100px", height: "100px", color: "#57534e", ...style }}
    >
      {/* Sketched Rolling Pin */}
      <path d="M 12,24 Q 16,21 16,28 Q 16,35 12,32" />
      <path d="M 16,28 L 82,28" />
      <path d="M 16,23 L 82,23" />
      <path d="M 82,24 Q 86,21 86,28 Q 86,35 82,32" />
      <path d="M 16,23 L 16,33" />
      <path d="M 82,23 L 82,33" />
      
      {/* Sketched Whisk */}
      <path d="M 28,82 L 34,82 L 34,58 L 28,58 Z" />
      <path d="M 31,58 C 18,52 18,36 31,34 C 44,36 44,52 31,58 Z" />
      <path d="M 31,34 C 23,38 23,50 31,58" />
      <path d="M 31,34 C 39,38 39,50 31,58" />
      
      {/* Sketched Ladle */}
      <path d="M 68,38 Q 66,54 54,64 L 78,84 Q 82,80 78,76 L 62,58" />
      <path d="M 54,46 Q 62,52 64,42" />
    </svg>
  );
}

export function ServingDoodle({ className, style }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className} 
      style={{ width: "100px", height: "100px", color: "#57534e", ...style }}
    >
      {/* Wobbly Plate Rim */}
      <path d="M 10,50 Q 50,36 90,50" />
      <path d="M 10,50 Q 50,86 90,50" />
      
      {/* Wobbly Bowl Center */}
      <path d="M 24,50 Q 50,74 76,50" strokeWidth="2" />
      
      {/* Steaming Heat Doodles */}
      <path d="M 38,36 Q 41,24 43,36" strokeWidth="1.5" />
      <path d="M 50,32 Q 53,20 55,32" strokeWidth="1.5" />
      <path d="M 62,36 Q 65,24 67,36" strokeWidth="1.5" />
      
      {/* Crossed Fork & Spoon behind plate */}
      <path d="M 15,75 L 35,55" strokeWidth="1.5" />
      <path d="M 15,75 Q 12,78 18,80 L 22,76" strokeWidth="1.5" />
      
      <path d="M 85,75 L 65,55" strokeWidth="1.5" />
      <path d="M 85,75 Q 88,78 82,80 L 78,76" strokeWidth="1.5" />
    </svg>
  );
}
