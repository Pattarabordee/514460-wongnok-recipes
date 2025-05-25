
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function RecipeFormLoaderDialog({ open, onOpenChange }: { open: boolean, onOpenChange: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col items-center justify-center text-center gap-5 min-h-[150px]">
        <Loader2 className="animate-spin w-8 h-8 text-emerald-600 mx-auto" />
        <div className="text-emerald-700 font-semibold text-lg">
          กำลังตรวจสอบสิทธิ์ผู้ใช้...
        </div>
      </DialogContent>
    </Dialog>
  );
}
