
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit, Home } from "lucide-react";
import RecipeForm from "@/components/RecipeForm";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface MyRecipe {
  id: string;
  title: string;
  image_url: string | null;
  prep_time: number;
  difficulty: string;
  description: string;
}

// กำหนด Name ของแท็บต่างๆ
const TABS = [
  { value: "my", label: "ของฉัน" },
  { value: "member", label: "โดยสมาชิกอื่น" },
  { value: "rating", label: "ยอดนิยม" }
] as const;

// Step 2: Define TabValue type 
type TabValue = typeof TABS[number]["value"];

export default function MyRecipes() {
  const { user, loading } = useAuthUser();
  // แก้ไข useState ให้ชัดเจนเป็น TabValue
  const [openForm, setOpenForm] = useState<null | { mode: "new" } | { mode: "edit", recipe: MyRecipe }>(null);
  const [viewTab, setViewTab] = useState<TabValue>("my");
  const queryClient = useQueryClient();

  // ดึงสูตรอาหารของ user นี้
  const { data: myRecipes, isLoading: loadingMy } = useQuery({
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

  // ดึงสูตรอาหารของสมาชิกคนอื่น
  const { data: memberRecipes, isLoading: loadingMember } = useQuery({
    queryKey: ["member-recipes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time, difficulty, description")
        .neq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MyRecipe[];
    },
    enabled: !!user && !loading,
  });

  // ดึงสูตรอาหารเรียงตาม rating
  const { data: topRecipes, isLoading: loadingRating } = useQuery({
    queryKey: ["top-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("recipes_with_avg_rating");
      if (error || !data) {
        const { data: fallback, error: fallbackError } = await supabase
          .from("recipes")
          .select("id, title, image_url, prep_time, difficulty, description")
          .order("created_at", { ascending: false });
        if (fallbackError) throw fallbackError;
        return fallback as MyRecipe[];
      }
      return data as MyRecipe[];
    },
    enabled: viewTab === "rating" && !loading,
  });

  // ลบสูตร
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-recipes", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["member-recipes", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["top-recipes"] });
    }
  });

  if (loading) return (
    <div className="flex justify-center items-center h-44">
      <Loader2 className="animate-spin" />
    </div>
  );

  // map ตาม tab
  let recipes: MyRecipe[]|undefined = [];
  let isLoading = false;
  if (viewTab === "my") {
    recipes = myRecipes;
    isLoading = loadingMy;
  } else if (viewTab === "member") {
    recipes = memberRecipes;
    isLoading = loadingMember;
  } else if (viewTab === "rating") {
    recipes = topRecipes;
    isLoading = loadingRating;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="mr-2">
          <Button variant="outline">
            <Home className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-emerald-700">สูตรอาหารของฉัน</h1>
        <Button onClick={() => setOpenForm({ mode: "new" })}>
          <Plus className="w-4 h-4 mr-2" /> เพิ่มสูตรอาหารใหม่
        </Button>
      </div>
      {/* Tabs มุมมอง */}
      <Tabs
        value={viewTab}
        // setViewTab รับค่าที่เป็น TabValue เท่านั้น!
        onValueChange={(val: TabValue) => setViewTab(val)}
        className="mb-6"
      >
        <TabsList>
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
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
                {viewTab === "my" && (
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" onClick={() => setOpenForm({ mode: "edit", recipe: r })}>
                      <Edit className="w-4 h-4" /> แก้ไข
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(r.id)}>
                      <Trash2 className="w-4 h-4" /> ลบ
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 my-16">ยังไม่มีสูตรอาหารของ{viewTab === "my" ? "คุณ" : viewTab === "member" ? "สมาชิกอื่น" : "หมวดนี้"}</div>
        )}
      {openForm && (
        <RecipeForm
          mode={openForm.mode}
          recipe={openForm.mode === "edit" ? openForm.recipe : undefined}
          onCancel={() => setOpenForm(null)}
          onSuccess={() => {
            setOpenForm(null);
            queryClient.invalidateQueries({ queryKey: ["my-recipes", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["member-recipes", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["top-recipes"] });
          }}
        />
      )}
    </div>
  );
}
