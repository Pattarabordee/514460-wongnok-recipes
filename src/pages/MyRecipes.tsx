
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import RecipeForm from "@/components/RecipeForm";
import { Card } from "@/components/ui/card";

export interface MyRecipe {
  id: string;
  title: string;
  image_url: string | null;
  prep_time: number;
  difficulty: string;
  description: string;
}

export default function MyRecipes() {
  const { user, loading } = useAuthUser();
  const [openForm, setOpenForm] = useState<null | { mode: "new" } | { mode: "edit", recipe: MyRecipe }>(null);
  const queryClient = useQueryClient();

  // ดึงสูตรอาหารของ user คนนี้
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["my-recipes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time, difficulty, description")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MyRecipe[];
    },
    enabled: !!user && !loading,
  });

  // ลบสูตร
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-recipes", user?.id] });
    }
  });

  if (loading) return (
    <div className="flex justify-center items-center h-44">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-emerald-700">สูตรอาหารของฉัน</h1>
        <Button onClick={() => setOpenForm({ mode: "new" })}>
          <Plus className="w-4 h-4 mr-2" /> เพิ่มสูตรอาหารใหม่
        </Button>
      </div>
      {isLoading
        ? <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
        : (recipes && recipes.length > 0) ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map(r => (
              <Card key={r.id} className="p-4 flex flex-col relative">
                {r.image_url && (
                  <img src={r.image_url} alt={r.title} className="w-full h-36 object-cover rounded mb-3" />
                )}
                <h2 className="text-lg font-semibold mb-1">{r.title}</h2>
                <div className="text-xs text-gray-500 mb-2">{r.difficulty} • {r.prep_time} นาที</div>
                <div className="text-gray-700 text-sm line-clamp-2 mb-3">{r.description}</div>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" variant="outline" onClick={() => setOpenForm({ mode: "edit", recipe: r })}>
                    <Edit className="w-4 h-4" /> แก้ไข
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(r.id)}>
                    <Trash2 className="w-4 h-4" /> ลบ
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 my-16">ยังไม่มีสูตรอาหารของคุณ</div>
        )}
      {/* ฟอร์ม create/edit */}
      {openForm && (
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
