
import React from "react";

export default function RecipeFormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="block mb-1 text-emerald-800 font-medium text-sm">{label}</label>
      {children}
    </div>
  );
}
