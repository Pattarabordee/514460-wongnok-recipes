
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEffect } from "react";

type RecipeFormValues = {
  title: string;
  description: string;
  image_url?: string | null;
  prep_time: number;
  difficulty: string;
};

interface RecipeFormProps {
  mode: "new" | "edit";
  recipe?: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    prep_time: number;
    difficulty: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-3">
    <label className="block mb-1 text-emerald-800 font-medium">{label}</label>
    {children}
  </div>
);

export default function RecipeForm({ mode, recipe, onCancel, onSuccess }: RecipeFormProps) {
  const { user } = useAuthUser();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<RecipeFormValues>({
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      image_url: recipe?.image_url || "",
      prep_time: recipe?.prep_time || 10,
      difficulty: recipe?.difficulty || "ง่าย",
    }
  });

  useEffect(() => {
    if (recipe) {
      reset({
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url || "",
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
      });
    }
  }, [recipe, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user) throw new Error("ต้องเข้าสู่ระบบก่อน");
      const { error } = await supabase.from("recipes").insert({
        ...data,
        user_id: user.id
      });
      if (error) throw error;
    },
    onSuccess: onSuccess
  });

  const updateMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user || !recipe) throw new Error("Invalid");
      const { error } = await supabase
        .from("recipes")
        .update({ ...data })
        .eq("id", recipe.id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: onSuccess
  });

  const onSubmit = (data: RecipeFormValues) => {
    if (mode === "new") return createMutation.mutate(data);
    return updateMutation.mutate(data);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <h2 className="text-lg font-bold mb-4 text-emerald-700">
          {mode === "new" ? "เพิ่มสูตรอาหารใหม่" : "แก้ไขสูตรอาหาร"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormField label="ชื่อสูตรอาหาร">
            <input
              {...register("title", { required: true })}
              type="text"
              className="input input-bordered w-full"
              required
            />
          </FormField>
          <FormField label="รายละเอียด">
            <textarea
              {...register("description", { required: true })}
              className="input input-bordered w-full min-h-[80px]"
              required
            />
          </FormField>
          <FormField label="ลิงก์รูปอาหาร (optional)">
            <input
              {...register("image_url")}
              type="text"
              className="input input-bordered w-full"
              placeholder="https://example.com/image.jpg"
            />
          </FormField>
          <div className="flex space-x-3">
            <FormField label="เวลาทำ (นาที)">
              <input
                {...register("prep_time", { required: true, valueAsNumber: true, min: 1 })}
                type="number"
                min={1}
                className="input input-bordered w-28"
                required
              />
            </FormField>
            <FormField label="ระดับความยาก">
              <select {...register("difficulty", { required: true })} className="input input-bordered w-32" required>
                <option value="ง่าย">ง่าย</option>
                <option value="ปานกลาง">ปานกลาง</option>
                <option value="ยาก">ยาก</option>
                <option value="ยากมาก">ยากมาก</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={onCancel}>ยกเลิก</Button>
            <Button type="submit" loading={isSubmitting}>
              {mode === "new" ? "บันทึกสูตร" : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
