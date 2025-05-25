
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RecipeFormUnauthDialog({ open, onOpenChange }: { open: boolean, onOpenChange: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center flex flex-col items-center justify-center gap-6">
        <div className="text-lg font-bold text-emerald-700 mt-2">กรุณาเข้าสู่ระบบก่อนเพิ่มหรือแก้ไขสูตรอาหารของคุณ</div>
        <Button onClick={onOpenChange} className="mx-auto mt-4">กลับ</Button>
      </DialogContent>
    </Dialog>
  );
}
