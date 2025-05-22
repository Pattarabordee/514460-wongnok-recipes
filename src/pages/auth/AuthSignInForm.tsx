
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

export default function AuthSignInForm({ onSwitchMode, toast }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: getErrorText(error.message),
          variant: "destructive",
        });
      }
      // success: user will be redirected via AuthPage useEffect
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
        type="password"
        placeholder="รหัสผ่าน"
        disabled={loading}
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <span className="animate-spin mr-2"><LogIn /></span>}
        เข้าสู่ระบบ
      </Button>
    </form>
  );
}
