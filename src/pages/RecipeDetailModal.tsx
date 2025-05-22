
import { X, BookOpen } from "lucide-react";
import RatingStars from "@/components/RatingStars";

interface RecipeDetailModalProps {
  recipe: {
    id: string;
    title: string;
    image: string;
    cookingTime: string;
    difficulty: string;
    ingredients: string[];
    steps: string[];
    author: string;
    rating: number;
    ratingsCount: number;
  };
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition"
          aria-label="ปิดหน้าต่าง"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <img src={recipe.image} alt={recipe.title} className="rounded-lg w-full md:w-44 h-44 object-cover" loading="lazy" />
          <div className="flex-1">
            <div className="flex gap-2 items-baseline">
              <h2 className="text-2xl font-bold text-emerald-700">{recipe.title}</h2>
              <span className="ml-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">{recipe.cookingTime}</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{recipe.difficulty}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <RatingStars rating={recipe.rating} />
              <span className="text-xs text-gray-500 ml-2">({recipe.ratingsCount} คะแนนรีวิว)</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">โดย {recipe.author}</p>
            <h3 className="font-semibold mt-4 mb-1 flex gap-1 items-center text-emerald-700"><BookOpen size={18} /> ส่วนผสม</h3>
            <ul className="list-disc list-inside text-gray-800 text-sm mb-4">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h3 className="font-semibold mb-1 text-emerald-700">วิธีทำ</h3>
            <ol className="list-decimal list-inside text-gray-800 text-sm space-y-1">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
