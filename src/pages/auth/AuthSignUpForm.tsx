
import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { getErrorText } from "./authErrorUtils";
import type { AuthMode } from "./AuthPage";

interface Props {
  onSwitchMode: (mode: AuthMode) => void;
  toast: Function;
}

export default function AuthSignUpForm({ onSwitchMode, toast }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { username } }
      });
      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: getErrorText(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "สมัครสมาชิกสำเร็จ",
          description: "สมัครสมาชิกสำเร็จ สามารถเข้าสู่ระบบได้ทันที",
        });
        // ล้างค่า input ให้กรอกใหม่
        setEmail("");
        setPassword("");
        setUsername("");
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
      <Input
        required
        placeholder="ชื่อผู้ใช้ (ชื่อเล่น)"
        disabled={loading}
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoComplete="username"
      />
      <Input
        required
        type="password"
        placeholder="รหัสผ่าน"
        disabled={loading}
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <span className="animate-spin mr-2"><LogIn /></span>}
        สมัครสมาชิก
      </Button>
    </form>
  );
}
