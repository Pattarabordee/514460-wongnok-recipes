
import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorText } from "./authErrorUtils";
import type { AuthMode } from "./AuthPage";

interface Props {
  onSwitchMode: (mode: AuthMode) => void;
  toast: Function;
}

export default function AuthResetPasswordForm({ onSwitchMode, toast }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: getErrorText(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "ส่งลิงก์สำหรับเปลี่ยนรหัสผ่านแล้ว",
          description: "กรุณาตรวจสอบอีเมลของคุณ",
        });
        setEmail("");
        onSwitchMode("signin");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        required
        type="email"
        placeholder="อีเมล"
        disabled={loading}
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        ขอเปลี่ยนรหัสผ่าน
      </Button>
    </form>
  );
}
