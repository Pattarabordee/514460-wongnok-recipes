
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import AuthSignInForm from "./AuthSignInForm";
import AuthSignUpForm from "./AuthSignUpForm";
import AuthResetPasswordForm from "./AuthResetPasswordForm";

export type AuthMode = "signin" | "signup" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) navigate("/");
    });
    return () => { subscription.unsubscribe(); };
  }, [navigate]);

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
          {mode === "signin" && (
            <AuthSignInForm
              onSwitchMode={setMode}
              toast={toast}
            />
          )}
          {mode === "signup" && (
            <AuthSignUpForm
              onSwitchMode={setMode}
              toast={toast}
            />
          )}
          {mode === "reset" && (
            <AuthResetPasswordForm
              onSwitchMode={setMode}
              toast={toast}
            />
          )}
          <div className="mt-4 text-center flex flex-col gap-2 text-sm">
            {mode === "signin" && (
              <>
                <span>
                  ยังไม่มีบัญชี?
                  {" "}
                  <button className="text-emerald-700 hover:underline" onClick={() => setMode("signup")}>
                    สมัครสมาชิก
                  </button>
                </span>
                <button className="text-gray-500 hover:underline mt-1" onClick={() => setMode("reset")}>
                  ลืมรหัสผ่าน?
                </button>
              </>
            )}
            {mode === "signup" && (
              <span>
                มีบัญชีแล้ว?
                {" "}
                <button className="text-emerald-700 hover:underline" onClick={() => setMode("signin")}>
                  เข้าสู่ระบบ
                </button>
              </span>
            )}
            {mode === "reset" && (
              <span>
                <button className="text-emerald-700 hover:underline" onClick={() => setMode("signin")}>
                  กลับสู่หน้าเข้าสู่ระบบ
                </button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
