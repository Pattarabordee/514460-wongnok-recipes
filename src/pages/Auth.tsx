import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LogIn } from "lucide-react";

type AuthMode = "signin" | "signup" | "reset";

// Error code to Thai text
const errorMessages: Record<string, string> = {
  "User already registered": "อีเมลนี้ถูกใช้งานแล้ว",
  "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Email not confirmed": "กรุณายืนยันอีเมลของคุณ",
};

const getErrorText = (msg: string) => {
  for (const [code, thMsg] of Object.entries(errorMessages)) {
    if (msg.includes(code)) return thMsg;
  }
  return msg;
};

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ถ้ามี session -> ส่งไปหน้าแรก
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    // ฟัง event ของการเปลี่ยนสถานะ auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) navigate("/");
    });
    return () => { subscription.unsubscribe(); };
  }, [navigate]);

  // signin, signup, reset password
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (mode === "signup") {
          // สร้างบัญชีใหม่
          const { error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username },
            }
          });
          if (signUpErr) {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: getErrorText(signUpErr.message),
              variant: "destructive",
            });
          } else {
            toast({
              title: "สมัครสมาชิกสำเร็จ",
              description: "กรุณาตรวจสอบอีเมลของคุณ (หากเปิดยืนยันอีเมล)",
            });
          }
        } else if (mode === "signin") {
          // ล็อกอิน email/password
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInErr) {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: getErrorText(signInErr.message),
              variant: "destructive",
            });
          }
        } else if (mode === "reset") {
          // ส่งลิงก์เปลี่ยนรหัสผ่าน
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/auth",
          });
          if (resetErr) {
            toast({
              title: "เกิดข้อผิดพลาด",
              description: getErrorText(resetErr.message),
              variant: "destructive",
            });
          } else {
            toast({
              title: "ส่งลิงก์สำหรับเปลี่ยนรหัสผ่านแล้ว",
              description: "กรุณาตรวจสอบอีเมลของคุณ",
            });
            setMode("signin");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, username, toast]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-emerald-700">
            {mode === "signin" && "เข้าสู่ระบบ"}
            {mode === "signup" && "สมัครสมาชิก"}
            {mode === "reset" && "รีเซ็ตรหัสผ่าน"}
          </h1>
          <p className="text-muted-foreground">
            Wongnok recipes — คอมมูนิตี้แบ่งปันสูตรอาหาร
          </p>
        </CardHeader>
        <CardContent>
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
            {mode === "signup" && (
              <Input
                required
                placeholder="ชื่อผู้ใช้ (ชื่อเล่น)"
                disabled={loading}
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            )}
            {(mode === "signin" || mode === "signup") && (
              <Input
                required
                type="password"
                placeholder="รหัสผ่าน"
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <span className="animate-spin mr-2"><LogIn /></span>}
              {mode === "signin" && "เข้าสู่ระบบ"}
              {mode === "signup" && "สมัครสมาชิก"}
              {mode === "reset" && "ขอเปลี่ยนรหัสผ่าน"}
            </Button>
          </form>
          <div className="mt-4 text-center flex flex-col gap-2 text-sm">
            {mode === "signin" && (
              <>
                <span>ยังไม่มีบัญชี?{" "}
                  <button className="text-emerald-700 hover:underline" onClick={() => setMode("signup")}>สมัครสมาชิก</button>
                </span>
                <button className="text-gray-500 hover:underline mt-1" onClick={() => setMode("reset")}>ลืมรหัสผ่าน?</button>
              </>
            )}
            {mode === "signup" && (
              <>
                <span>มีบัญชีแล้ว?{" "}
                  <button className="text-emerald-700 hover:underline" onClick={() => setMode("signin")}>เข้าสู่ระบบ</button>
                </span>
              </>
            )}
            {mode === "reset" && (
              <span>
                <button className="text-emerald-700 hover:underline" onClick={() => setMode("signin")}>กลับสู่หน้าเข้าสู่ระบบ</button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
