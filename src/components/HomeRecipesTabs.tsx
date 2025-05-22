
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  image_url: string | null;
  prep_time: number;
  difficulty: string;
  description: string;
}

const TABS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "member", label: "โดยสมาชิกอื่น" },
  { value: "rating", label: "ยอดนิยม" },
] as const;

export default function HomeRecipesTabs() {
  const [tab, setTab] = useState<string>("all");

  // Query: All recipes
  const { data: allRecipes, isLoading: loadingAll } = useQuery({
    queryKey: ["home-all-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time, difficulty, description")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: tab === "all",
  });

  // Query: Member recipes (skip filter for now – show all, you can adjust to exclude current user if implementing profile logic)
  const { data: memberRecipes, isLoading: loadingMember } = useQuery({
    queryKey: ["home-member-recipes"],
    queryFn: async () => {
      // Just for demo, show the same as all
      const { data, error } = await supabase
        .from("recipes")
        .select("id, title, image_url, prep_time, difficulty, description")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Recipe[];
    },
    enabled: tab === "member",
  });

  // Query: Top recipes by rating
  const { data: topRecipes, isLoading: loadingTop } = useQuery({
    queryKey: ["home-top-recipes"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("recipes_with_avg_rating");
      if (error || !data) {
        // fallback: latest
        const { data: fallback, error: fallbackError } = await supabase
          .from("recipes")
          .select("id, title, image_url, prep_time, difficulty, description")
          .order("created_at", { ascending: false });
        if (fallbackError) throw fallbackError;
        return fallback as Recipe[];
      }
      return data as Recipe[];
    },
    enabled: tab === "rating",
  });

  let recipes: Recipe[] | undefined = [];
  let isLoading = false;

  if (tab === "all") {
    recipes = allRecipes;
    isLoading = loadingAll;
  } else if (tab === "member") {
    recipes = memberRecipes;
    isLoading = loadingMember;
  } else if (tab === "rating") {
    recipes = topRecipes;
    isLoading = loadingTop;
  }

  return (
    <div>
      <Tabs
        value={tab}
        onValueChange={setTab as (val: string) => void}
        className="mb-6"
      >
        <TabsList>
          {TABS.map((tabDef) => (
            <TabsTrigger key={tabDef.value} value={tabDef.value}>
              {tabDef.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {isLoading
        ? <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" /></div>
        : recipes && recipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((r) => (
              <Card key={r.id} className="p-4 flex flex-col relative">
                {r.image_url && (
                  <img src={r.image_url} alt={r.title} className="w-full h-36 object-cover rounded mb-3" />
                )}
                <h2 className="text-lg font-semibold mb-1">{r.title}</h2>
                <div className="text-xs text-gray-500 mb-2">{r.difficulty} • {r.prep_time} นาที</div>
                <div className="text-gray-700 text-sm line-clamp-2 mb-3">{r.description}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 my-16">ไม่พบสูตรอาหารในมุมมองนี้</div>
        )}
    </div>
  );
}
