import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEffect, useState } from "react";

type RecipeFormValues = {
  title: string;
  description: string;
  image_url?: string | null;
  prep_time: number;
  difficulty: string;
  ingredients?: any;
  instructions?: any;
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
    ingredients?: any;
    instructions?: any;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

const PRESET_DIFFICULTIES = ["ง่าย", "ปานกลาง", "ยาก", "ยากมาก"];
const PRESET_PREP_TIMES = [10, 20, 30, 45, 60];

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-3">
    <label className="block mb-1 text-emerald-800 font-medium">{label}</label>
    {children}
  </div>
);

export default function RecipeForm({ mode, recipe, onCancel, onSuccess }: RecipeFormProps) {
  const { user } = useAuthUser();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting }
  } = useForm<RecipeFormValues>({
    defaultValues: {
      title: recipe?.title || "",
      description: recipe?.description || "",
      image_url: recipe?.image_url || "",
      prep_time: recipe?.prep_time || 10,
      difficulty: recipe?.difficulty || "ง่าย",
    }
  });

  // --- State for custom difficulty ---
  const [customDifficulty, setCustomDifficulty] = useState<string>(
    recipe && !PRESET_DIFFICULTIES.includes(recipe.difficulty) ? recipe.difficulty : ""
  );
  // --- State for custom prep time ---
  const [prepTimeType, setPrepTimeType] = useState<"preset" | "custom">(
    recipe && recipe.prep_time && !PRESET_PREP_TIMES.includes(recipe.prep_time)
      ? "custom"
      : "preset"
  );
  const [customPrepTime, setCustomPrepTime] = useState<number>(
    recipe && recipe.prep_time && !PRESET_PREP_TIMES.includes(recipe.prep_time)
      ? recipe.prep_time
      : PRESET_PREP_TIMES[0]
  );

  // keep form in sync with props
  useEffect(() => {
    if (recipe) {
      reset({
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url || "",
        prep_time: recipe.prep_time,
        difficulty: recipe.difficulty,
      });
      setCustomDifficulty(
        !PRESET_DIFFICULTIES.includes(recipe.difficulty)
          ? recipe.difficulty
          : ""
      );
      setPrepTimeType(
        !PRESET_PREP_TIMES.includes(recipe.prep_time)
          ? "custom"
          : "preset"
      );
      setCustomPrepTime(
        !PRESET_PREP_TIMES.includes(recipe.prep_time)
          ? recipe.prep_time
          : PRESET_PREP_TIMES[0]
      );
    }
  }, [recipe, reset]);

  // Submit handlers unchanged, just ensure values handled correctly below

  // 1. CREATE
  const createMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user) throw new Error("ต้องเข้าสู่ระบบก่อน");
      // Add ingredients and instructions default values if missing
      const payload = {
        ...data,
        user_id: user.id,
        ingredients: [],
        instructions: [],
      };
      const { error } = await supabase.from("recipes").insert(payload);
      if (error) throw error;
    },
    onSuccess: onSuccess
  });

  // 2. UPDATE
  const updateMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user || !recipe) throw new Error("Invalid");
      // Make sure to keep ingredients/instructions (fallback to empty if undefined)
      const payload = {
        ...data,
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
      };
      const { error } = await supabase
        .from("recipes")
        .update(payload)
        .eq("id", recipe.id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: onSuccess
  });

  // Watch difficulty and prep_time to set the right value before submit
  const selectedDifficulty = watch("difficulty");
  const selectedPrepTime = watch("prep_time");

  const onSubmit = (data: RecipeFormValues) => {
    const finalData: RecipeFormValues = {
      ...data,
      difficulty:
        selectedDifficulty === "อื่นๆ"
          ? customDifficulty.trim() || "อื่นๆ"
          : selectedDifficulty,
      prep_time:
        prepTimeType === "custom"
          ? customPrepTime || 1
          : Number(selectedPrepTime),
    };
    if (mode === "new") return createMutation.mutate(finalData);
    return updateMutation.mutate(finalData);
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
            {/* Prep time section */}
            <FormField label="เวลาทำ (นาที)">
              <div>
                <div className="flex gap-2 mb-1">
                  {PRESET_PREP_TIMES.map((pt) => (
                    <label key={pt} className="flex items-center gap-1">
                      <input
                        type="radio"
                        className="radio radio-sm"
                        name="prep-time"
                        checked={prepTimeType === "preset" && Number(selectedPrepTime) === pt}
                        onChange={() => {
                          setPrepTimeType("preset");
                          setValue("prep_time", pt);
                        }}
                      />
                      <span>{pt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      className="radio radio-sm"
                      name="prep-time"
                      checked={prepTimeType === "custom"}
                      onChange={() => {
                        setPrepTimeType("custom");
                        setValue("prep_time", customPrepTime);
                      }}
                    />
                    <span>กำหนดเอง</span>
                  </label>
                </div>
                {prepTimeType === "custom" && (
                  <div>
                    <input
                      type="number"
                      className="input input-bordered w-24"
                      min={1}
                      value={customPrepTime}
                      onChange={e => {
                        const val = Math.max(1, Number(e.target.value));
                        setCustomPrepTime(val);
                        setValue("prep_time", val);
                      }}
                      required
                    />{" "}
                    <span className="text-xs text-gray-500">นาที</span>
                  </div>
                )}
              </div>
            </FormField>
            {/* Difficulty section */}
            <FormField label="ระดับความยาก">
              <div>
                <select
                  {...register("difficulty", { required: true })}
                  className="input input-bordered w-32"
                  value={
                    PRESET_DIFFICULTIES.includes(selectedDifficulty)
                      ? selectedDifficulty
                      : customDifficulty
                      ? "อื่นๆ"
                      : selectedDifficulty
                  }
                  onChange={e => {
                    const val = e.target.value;
                    setValue("difficulty", val);
                    if (val === "อื่นๆ") {
                      setCustomDifficulty("");
                    }
                  }}
                  required
                >
                  {PRESET_DIFFICULTIES.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                  <option value="อื่นๆ">+ เพิ่มระดับเอง</option>
                </select>
                {selectedDifficulty === "อื่นๆ" && (
                  <input
                    type="text"
                    className="input input-bordered w-32 mt-2"
                    placeholder="เช่น พิเศษสุด/ศิลปะ"
                    value={customDifficulty}
                    maxLength={30}
                    onChange={e => setCustomDifficulty(e.target.value)}
                    required
                  />
                )}
              </div>
            </FormField>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>ยกเลิก</Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "new" ? "บันทึกสูตร" : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
