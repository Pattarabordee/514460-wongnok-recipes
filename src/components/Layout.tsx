import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNavigate, Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, Home, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuthUser();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow py-3 px-4 sm:py-4 sm:px-6 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Home button - hidden on mobile, shown on larger screens */}
          <Link to="/" className="hidden sm:block">
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Home className="w-5 h-5" />
              <span>หน้าหลัก</span>
            </Button>
          </Link>
          
          {/* Logo */}
          <span className="text-base sm:text-lg lg:text-2xl font-bold text-emerald-700 tracking-wide">
            <a href="/" className="hover:text-emerald-900 transition-colors">
              Wongnok recipes
            </a>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {user && (
            <Link to="/my-recipes">
              <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                สูตรอาหารของฉัน
              </Button>
            </Link>
          )}
          {user && (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="text-xs lg:text-sm">
                แก้ไขโปรไฟล์
              </Button>
            </Link>
          )}
          {loading ? null : !user ? (
            <Button variant="secondary" onClick={() => navigate("/auth")} className="flex items-center gap-2 text-xs lg:text-sm">
              <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                {profile?.avatar_url ?
                  <AvatarImage src={profile.avatar_url} alt={profile.username || "avatar"} /> :
                  <AvatarFallback className="text-xs">{profile?.username?.[0] || user.email[0]}</AvatarFallback>
                }
              </Avatar>
              <span className="text-emerald-700 font-medium text-sm hidden lg:block">
                {profile?.username || user.email}
              </span>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-xs lg:text-sm">
                <LogOut className="w-4 h-4" /> ออกจากระบบ
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t md:hidden z-50">
            <div className="p-4 space-y-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  หน้าหลัก
                </Button>
              </Link>
              
              {user && (
                <Link to="/my-recipes" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    สูตรอาหารของฉัน
                  </Button>
                </Link>
              )}
              
              {user && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    แก้ไขโปรไฟล์
                  </Button>
                </Link>
              )}
              
              {loading ? null : !user ? (
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }} 
                  className="w-full justify-start"
                >
                  <LogIn className="w-4 h-4 mr-2" /> เข้าสู่ระบบ
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="w-8 h-8">
                      {profile?.avatar_url ?
                        <AvatarImage src={profile.avatar_url} alt={profile.username || "avatar"} /> :
                        <AvatarFallback className="text-xs">{profile?.username?.[0] || user.email[0]}</AvatarFallback>
                      }
                    </Avatar>
                    <span className="text-emerald-700 font-medium text-sm">
                      {profile?.username || user.email}
                    </span>
                  </div>
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">{children}</main>
      
      <footer className="py-6 sm:py-8 bg-emerald-50 mt-8 sm:mt-12 text-center text-gray-600 text-xs sm:text-sm rounded-t-lg">
        &copy; {new Date().getFullYear()} Wongnok recipes. สงวนลิขสิทธิ์ทุกประการ
      </footer>
    </div>
  );
};

export default Layout;
