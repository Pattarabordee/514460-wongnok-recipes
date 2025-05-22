
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuthUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow py-4 px-6 flex items-center justify-between z-30 relative">
        <span className="text-lg sm:text-2xl font-bold text-emerald-700 tracking-wide">
          <a href="/" className="hover:text-emerald-900 transition-colors">Wongnok recipes</a>
        </span>
        <nav className="flex items-center">
          {loading ? null : !user ? (
            <Button variant="secondary" onClick={() => navigate("/auth")} className="flex items-center gap-2">
              <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar>
                {profile?.avatar_url ?
                  <AvatarImage src={profile.avatar_url} alt={profile.username || "avatar"} /> :
                  <AvatarFallback>{profile?.username?.[0] || user.email[0]}</AvatarFallback>
                }
              </Avatar>
              <span className="text-emerald-700 font-medium">{profile?.username || user.email}</span>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </Button>
            </div>
          )}
        </nav>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4">{children}</main>
      <footer className="py-8 bg-emerald-50 mt-12 text-center text-gray-600 text-sm rounded-t-lg">
        &copy; {new Date().getFullYear()} Wongnok recipes. สงวนลิขสิทธิ์ทุกประการ
      </footer>
    </div>
  );
};
export default Layout;
