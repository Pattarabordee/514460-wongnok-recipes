
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

  // Google login
  const googleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" }
    });
    if (error) {
      toast({
        title: "เข้าสู่ระบบด้วย Google ล้มเหลว",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

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
          {(mode === "signin" || mode === "signup") && (
            <>
              <div className="my-3 text-center">
                <span className="text-sm text-gray-500">หรือ</span>
              </div>
              <Button onClick={googleSignIn} className="w-full" variant="outline" disabled={loading}>
                <svg className="inline mr-2" width="20" height="20" viewBox="0 0 20 20"><g><path fill="#EA4335" d="M10 8.64v2.72h3.85c-.17 1-.98 2.73-3.85 2.73-2.33 0-4.23-1.93-4.23-4.29s1.9-4.29 4.23-4.29c1.33 0 2.23.57 2.75 1.06l1.88-1.81C13.17 3.17 11.7 2.36 10 2.36 5.98 2.36 2.77 5.57 2.77 9.5s3.21 7.14 7.23 7.14c4.16 0 6.92-2.92 6.92-7.05 0-.47-.05-.83-.12-1.19z"/><path fill="#34A853" d="M3.76 6.15l2.14 1.57c.57-.9 1.43-1.61 2.47-1.88V4.63H5.84A7.12 7.12 0 0 0 3.76 6.15z"/><path fill="#FBBC05" d="M10 2.36c1.7 0 3.17.58 4.37 1.69l-1.77 1.73c-.54-.51-1.4-1.06-2.6-1.06-1.04 0-1.9.41-2.52 1.03L3.76 6.15c.41-.63.92-1.22 1.59-1.56C6.27 3.46 7.99 2.36 10 2.36z"/><path fill="#4285F4" d="M16.92 10.33c0-.42-.04-.83-.12-1.19h-6.8v2.71h3.98c-.16.96-.96 2.75-3.98 2.75-2.33 0-4.23-1.94-4.23-4.29 0-2.36 1.9-4.3 4.23-4.3 1.12 0 2.01.4 2.75 1.06l1.88-1.81C13.17 3.17 11.7 2.36 10 2.36c-4.02 0-7.23 3.21-7.23 7.14s3.21 7.14 7.23 7.14c4.16 0 6.92-2.92 6.92-7.05z"/></g></svg>
                เข้าสู่ระบบด้วย Google
              </Button>
            </>
          )}
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
