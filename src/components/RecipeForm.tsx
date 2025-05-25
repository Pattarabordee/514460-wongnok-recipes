import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import RecipeFormField from "./RecipeFormField";
import RecipeFormLoaderDialog from "./RecipeFormLoaderDialog";
import RecipeFormUnauthDialog from "./RecipeFormUnauthDialog";

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

export default function RecipeForm({ mode, recipe, onCancel, onSuccess }: RecipeFormProps) {
  const { user, loading } = useAuthUser();
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

  const [customDifficulty, setCustomDifficulty] = useState<string>(
    recipe && !PRESET_DIFFICULTIES.includes(recipe.difficulty) ? recipe.difficulty : ""
  );
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

  // Sync with props
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

  // CREATE
  const createMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user || !user.id)
        throw new Error("กรุณาเข้าสู่ระบบก่อนบันทึกสูตรอาหาร");
      const payload = {
        ...data,
        user_id: user.id,
        ingredients: [],
        instructions: [],
      };
      console.log("[Create] ส่ง payload:", payload, "(user.id = ", user?.id, ")");
      const { error } = await supabase.from("recipes").insert(payload);
      if (error) throw error;
    },
    onSuccess: onSuccess,
    onError: (error: any) => {
      toast({
        title: "ไม่สามารถบันทึกสูตรอาหารได้",
        description: (error?.message as string) || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        variant: "destructive"
      });
    }
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: async (data: RecipeFormValues) => {
      if (!user || !recipe)
        throw new Error("กรุณาเข้าสู่ระบบก่อนแก้ไขสูตรอาหาร");
      const payload = {
        ...data,
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
      };
      console.log("[Update] ส่ง payload:", payload, "(user.id = ", user?.id, ")");
      const { error } = await supabase
        .from("recipes")
        .update(payload)
        .eq("id", recipe.id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: onSuccess,
    onError: (error: any) => {
      toast({
        title: "ไม่สามารถแก้ไขสูตรอาหารได้",
        description: (error?.message as string) || "เกิดข้อผิดพลาด กรุณาลองใหม่",
        variant: "destructive"
      });
    }
  });

  const selectedDifficulty = watch("difficulty");
  const selectedPrepTime = watch("prep_time");

  // 1. Loading state: show loader 
  if (loading) {
    return (
      <RecipeFormLoaderDialog open onOpenChange={onCancel} />
    );
  }

  // 2. Unauthenticated: block everything except cancel
  if (!user || !user.id) {
    return (
      <RecipeFormUnauthDialog open onOpenChange={onCancel} />
    );
  }

  // 3. Submission guard: fail-safe in handleSubmit
  const onSubmit = (data: RecipeFormValues) => {
    // Guard: Don't allow submit if user or user.id is missing
    if (!user || !user.id) {
      toast({
        title: "คุณยังไม่ได้เข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบก่อนบันทึกสูตรอาหารของคุณ",
        variant: "destructive"
      });
      return;
    }
    if (!user.id) {
      toast({
        title: "ไม่พบข้อมูลผู้ใช้",
        description: "Session ผู้ใช้หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        variant: "destructive"
      });
      return;
    }

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

    // Debug: ถ้าไม่มี user_id, ห้ามส่งข้อมูลและ log
    if (!user.id) {
      console.warn("[RecipeForm] Blocking submit: No user.id");
      toast({
        title: "ไม่สามารถบันทึกสูตรอาหารได้",
        description: "กรุณาเข้าสู่ระบบก่อนบันทึกสูตรอาหาร",
        variant: "destructive"
      });
      return;
    }

    console.log("[RecipeForm Submit]", {
      user,
      userId: user.id,
      finalData
    });

    // Prevent submission if user_id is missing or undefined
    if (!user.id) {
      toast({
        title: "ไม่สามารถบันทึกสูตรอาหารได้",
        description: "เกิดข้อผิดพลาด ไม่พบรหัสผู้ใช้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        variant: "destructive"
      });
      return;
    }

    if (mode === "new") {
      createMutation.mutate(finalData, {
        onError: (error: any) => {
          let newDescription = error?.message || String(error) || "เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลอีกครั้ง";
          // เพิ่มข้อความแนะนำเฉพาะกรณี foreign key error
          if (
            typeof newDescription === "string" &&
            newDescription.includes("violates foreign key constraint")
          ) {
            newDescription = "เกิดปัญหากับบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่ หรือรีเฟรชหน้าแล้วลองอีกครั้ง";
          }
          toast({
            title: "บันทึกสูตรอาหารล้มเหลว",
            description: newDescription,
            variant: "destructive",
          });
        },
      });
      return;
    }
    updateMutation.mutate(finalData, {
      onError: (error: any) => {
        let newDescription = error?.message || String(error) || "เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูลอีกครั้ง";
        if (
          typeof newDescription === "string" &&
          newDescription.includes("violates foreign key constraint")
        ) {
          newDescription = "เกิดปัญหากับบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่ หรือรีเฟรชหน้าแล้วลองอีกครั้ง";
        }
        toast({
          title: "บันทึกการแก้ไขสูตรอาหารล้มเหลว",
          description: newDescription,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-emerald-700">
          {mode === "new" ? "เพิ่มสูตรอาหารใหม่" : "แก้ไขสูตรอาหาร"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <RecipeFormField label="ชื่อสูตรอาหาร">
            <input
              {...register("title", { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              required
            />
          </RecipeFormField>
          <RecipeFormField label="รายละเอียด">
            <textarea
              {...register("description", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[80px] text-sm"
              required
            />
          </RecipeFormField>
          <RecipeFormField label="ลิงก์รูปอาหาร (optional)">
            <input
              {...register("image_url")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </RecipeFormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecipeFormField label="เวลาทำ (นาที)">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {PRESET_PREP_TIMES.map((pt) => (
                    <label key={pt} className="flex items-center gap-1">
                      <input
                        type="radio"
                        className="w-3 h-3"
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
                  <label className="flex items-center gap-1 col-span-2">
                    <input
                      type="radio"
                      className="w-3 h-3"
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
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min={1}
                      value={customPrepTime}
                      onChange={e => {
                        const val = Math.max(1, Number(e.target.value));
                        setCustomPrepTime(val);
                        setValue("prep_time", val);
                      }}
                      required
                    />
                    <span className="text-xs text-gray-500">นาที</span>
                  </div>
                )}
              </div>
            </RecipeFormField>
            <RecipeFormField label="ระดับความยาก">
              <div className="space-y-2">
                <select
                  {...register("difficulty", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="เช่น พิเศษสุด/ศิลปะ"
                    value={customDifficulty}
                    maxLength={30}
                    onChange={e => setCustomDifficulty(e.target.value)}
                    required
                  />
                )}
              </div>
            </RecipeFormField>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4 pt-4 border-t">
            <Button 
              variant="ghost" 
              type="button" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {mode === "new" ? "บันทึกสูตร" : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
