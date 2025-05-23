
import RecipeCard from "./RecipeCard";
import { sampleRecipes } from "@/assets/sample-recipes";
import { useState } from "react";
import RecipeDetailModal from "@/pages/RecipeDetailModal";

const RecipeList = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {sampleRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setOpenId(recipe.id)} />
        ))}
      </div>
      {openId && (
        <RecipeDetailModal
          recipe={sampleRecipes.find((r) => r.id === openId)!}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
};

export default RecipeList;
