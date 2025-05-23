
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Recipe = {
  id: string;
  title: string;
  image: string;
  cookingTime: string;
  difficulty: string;
  author: string;
  rating: number;
  ratingsCount: number;
};

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

const badgeColors: Record<string, string> = {
  "ง่าย": "bg-green-100 text-green-700",
  "ปานกลาง": "bg-yellow-100 text-yellow-800",
  "ยาก": "bg-orange-100 text-orange-800",
  "ยากมาก": "bg-red-100 text-red-800",
};

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => (
  <div
    className="group bg-white rounded-xl shadow hover:shadow-xl transition-shadow cursor-pointer flex flex-col animate-fade-in"
    onClick={onClick}
    tabIndex={0}
    aria-label={`ดูสูตรอาหาร: ${recipe.title}`}
    role="button"
  >
    <img
      src={recipe.image}
      alt={recipe.title}
      className="w-full h-36 sm:h-44 lg:h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-200"
      loading="lazy"
    />
    <div className="p-3 sm:p-5 flex flex-col flex-1">
      <h3 className="text-base sm:text-lg font-bold mb-2 text-emerald-700 line-clamp-2">
        {recipe.title}
      </h3>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className={cn(
          "px-2 sm:px-3 py-1 rounded-full text-xs font-semibold", 
          badgeColors[recipe.difficulty] || "bg-gray-100 text-gray-700"
        )}>
          {recipe.difficulty}
        </span>
        <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
          {recipe.cookingTime}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="flex items-center text-amber-500">
          <Star size={16} fill="#fbbf24" stroke="#fbbf24" className="mr-1" />
          <span className="font-medium text-sm">{recipe.rating.toFixed(1)}</span>
        </span>
        <span className="text-xs text-gray-500">({recipe.ratingsCount})</span>
        <span className="ml-auto text-xs text-gray-400 truncate">
          โดย {recipe.author}
        </span>
      </div>
    </div>
  </div>
);

export default RecipeCard;
