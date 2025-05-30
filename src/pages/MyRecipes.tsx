import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit, Home, Lock } from "lucide-react";
import RecipeForm from "@/components/RecipeForm";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export interface MyRecipe {
  id: string;
  title: string;
  image_url: string | null;
  prep_time: number;
  difficulty: string;
  description: string;
  ingredients?: any;
  instructions?: any;
}

export default function MyRecipes() {
  const { user, loading } = useAuthUser();
  const [openForm, setOpenForm] = useState<null | { mode: "new" } | { mode: "edit", recipe: MyRecipe }>(null);
  const queryClient = useQueryClient();

  const { data: myRecipes, isLoading: loadingMy } = useQuery({
    queryKey: ["my-recipes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time, difficulty, description, ingredients, instructions")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MyRecipe[];
    },
    enabled: !!user && !loading,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-recipes", user?.id] });
    }
  });

  // Prevent non-authenticated access to recipe form
  if (loading) return (
    <div className="flex justify-center items-center h-44">
      <Loader2 className="animate-spin" />
    </div>
  );

  // If not logged in, offer login redirect instead of recipe content
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] py-12 gap-4">
        <Lock className="w-10 h-10 text-gray-400 mb-2" />
        <div className="text-lg font-semibold text-emerald-800 mb-1">
          กรุณาเข้าสู่ระบบก่อนเพื่อจัดการสูตรอาหารของคุณ
        </div>
        <Link to="/auth">
          <Button className="px-6">เข้าสู่ระบบ</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Link to="/" className="order-2 sm:order-1">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Home className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
        </Link>
        
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 text-center order-1 sm:order-2">
          สูตรอาหารของฉัน
        </h1>

        {/* ป้องกันปุ่มเพิ่มสูตรแสดง (เฉพาะถ้าล็อกอินเท่านั้น) */}
        {user && (
          <Button 
            onClick={() => setOpenForm({ mode: "new" })}
            size="sm"
            className="order-3 w-full sm:w-auto text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">เพิ่มสูตรอาหารใหม่</span>
            <span className="sm:hidden">เพิ่มสูตร</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {loadingMy ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="animate-spin" />
        </div>
      ) : (myRecipes && myRecipes.length > 0) ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myRecipes.map(r => (
            <Card key={r.id} className="p-3 sm:p-4 flex flex-col relative">
              {r.image_url && (
                <img 
                  src={r.image_url} 
                  alt={r.title} 
                  className="w-full h-32 sm:h-36 lg:h-40 object-cover rounded mb-3" 
                />
              )}
              <h2 className="text-base sm:text-lg font-semibold mb-1 line-clamp-2">{r.title}</h2>
              <div className="text-xs text-gray-500 mb-2">
                {r.difficulty} • {r.prep_time} นาที
              </div>
              <div className="text-gray-700 text-xs sm:text-sm line-clamp-2 mb-3 flex-1">
                {r.description}
              </div>
              {/* NEW: แสดงรายการวัตถุดิบแบบย่อ */}
              {Array.isArray(r.ingredients) && r.ingredients[0]?.name && (
                <div className="mt-1 mb-3">
                  <div className="text-xs font-bold text-emerald-700 mb-0.5">วัตถุดิบ:</div>
                  <ul className="list-disc ml-5 text-xs text-gray-500">
                    {r.ingredients.slice(0, 4).map((ing, idx) =>
                      typeof ing === "object" ? (
                        <li key={idx}>
                          {ing.name}
                          {ing.quantity && ` ${ing.quantity}`}
                          {ing.unit && ` ${ing.unit}`}
                        </li>
                      ) : (
                        <li key={idx}>{ing}</li>
                      )
                    )}
                    {r.ingredients.length > 4 && <li>...</li>}
                  </ul>
                </div>
              )}
              {/* Responsive Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setOpenForm({ mode: "edit", recipe: r })}
                  className="text-xs flex-1"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
                  แก้ไข
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate(r.id)}
                  className="text-xs flex-1"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
                  ลบ
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 my-16 px-4">
          <p className="text-sm sm:text-base">ยังไม่มีสูตรอาหารของคุณ</p>
          <p className="text-xs sm:text-sm mt-2">เริ่มต้นเพิ่มสูตรอาหารแรกของคุณได้เลย!</p>
        </div>
      )}
      
      {/* RecipeForm can only be opened if user is authenticated */}
      {openForm && user && (
        <RecipeForm
          mode={openForm.mode}
          recipe={openForm.mode === "edit" ? openForm.recipe : undefined}
          onCancel={() => setOpenForm(null)}
          onSuccess={() => {
            setOpenForm(null);
            queryClient.invalidateQueries({ queryKey: ["my-recipes", user?.id] });
          }}
        />
      )}
    </div>
  );
}
