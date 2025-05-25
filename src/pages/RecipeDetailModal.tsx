import { X, BookOpen } from "lucide-react";
import RatingStars from "@/components/RatingStars";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useState } from "react";
import { useRecipeRating } from "@/hooks/useRecipeRating";
import { toast } from "@/hooks/use-toast";

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
    authorId?: string;
  };
  onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
  const { user } = useAuthUser();
  const {
    myRating,
    loadingMyRating,
    rate,
    rateIsPending,
    aggregate,
  } = useRecipeRating({ recipeId: recipe.id });
  const [hoverStar, setHoverStar] = useState<number | null>(null);

  const canRate =
    !!user &&
    (user.id !== recipe.authorId) &&
    !rateIsPending;

  const avgToDisplay = aggregate ? aggregate.avg : recipe.rating;
  const countToDisplay = aggregate ? aggregate.count : recipe.ratingsCount;

  const handleRate = (val: number) => {
    if (!user) {
      toast({
        title: "ต้องเข้าสู่ระบบก่อนให้คะแนน",
        variant: "destructive",
      });
      return;
    }
    if (user.id === recipe.authorId) {
      toast({
        title: "ไม่สามารถให้คะแนนสูตรอาหารของตนเองได้",
        variant: "destructive",
      });
      return;
    }
    rate(val, {
      onSuccess: () => {
        toast({
          title: "ขอบคุณสำหรับการให้คะแนน!",
        });
      },
      onError: (err: any) => {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: err?.message || String(err),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl relative animate-scale-in overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition z-10"
          aria-label="ปิดหน้าต่าง"
        >
          <X size={20} />
        </button>
        
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="rounded-lg w-full lg:w-80 h-48 sm:h-64 lg:h-80 object-cover" 
              loading="lazy" 
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 items-start mb-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 flex-1 min-w-0">
                  {recipe.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium whitespace-nowrap">
                    {recipe.cookingTime}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium whitespace-nowrap">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <RatingStars rating={avgToDisplay} />
                  <span className="text-sm text-gray-500">({countToDisplay} คะแนนรีวิว)</span>
                </div>
                
                {user && canRate && (
                  <div className="space-y-2">
                    <span className="text-sm text-emerald-600">
                      {myRating ? "แก้ไขคะแนนของคุณ:" : "ให้คะแนนสูตรนี้:"}
                    </span>
                    <div className="flex gap-1">
                      {/* FIX: Only show five stars */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`p-0 m-0 bg-transparent border-none transition-transform ${
                            hoverStar !== null && hoverStar >= i + 1 ? "scale-110" : ""
                          }`}
                          disabled={rateIsPending || user.id === recipe.authorId}
                          onMouseEnter={() => setHoverStar(i + 1)}
                          onMouseLeave={() => setHoverStar(null)}
                          onClick={() => handleRate(i + 1)}
                          aria-label={`ให้ ${i + 1} ดาว`}
                        >
                          <RatingStars rating={i + 1} />
                        </button>
                      ))}
                    </div>
                    {loadingMyRating ? (
                      <span className="text-xs text-gray-400">กำลังโหลดคะแนนของคุณ...</span>
                    ) : myRating ? (
                      <span className="text-xs text-gray-400">คะแนนของคุณ: {myRating}</span>
                    ) : null}
                  </div>
                )}
                
                {user && user.id === recipe.authorId && (
                  <span className="text-sm text-gray-400">
                    คุณไม่สามารถให้คะแนนสูตรของตนเองได้
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">โดย {recipe.author}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex gap-2 items-center text-emerald-700 text-base sm:text-lg">
                    <BookOpen size={18} /> ส่วนผสม
                  </h3>
                  <ul className="list-disc list-inside text-gray-800 text-sm space-y-1 ml-2">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-emerald-700 text-base sm:text-lg">วิธีทำ</h3>
                  <ol className="list-decimal list-inside text-gray-800 text-sm space-y-2 ml-2">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
