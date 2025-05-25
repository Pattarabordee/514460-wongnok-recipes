
import { useAuthUser } from "@/hooks/useAuthUser";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AVATAR_BUCKET = "avatars";

const ProfileEdit = () => {
  const { user, profile, loading } = useAuthUser();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  if (loading) {
    return <div className="py-12 text-center text-emerald-600 animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  }

  if (!user) {
    // redirect if not logged in
    navigate("/auth");
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let newAvatarUrl = avatarUrl;

    // Handle avatar upload if user selected a file
    if (avatarFile) {
      // Ensure bucket exists (silent fail if not)
      try { await supabase.storage.createBucket(AVATAR_BUCKET, { public: true }); } catch {}
      // Generate a unique path
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, avatarFile, {
        upsert: true,
      });
      if (uploadError) {
        toast.error("อัปโหลดรูปภาพล้มเหลว");
        setSaving(false);
        return;
      }
      const { data: publicUrl } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      newAvatarUrl = publicUrl?.publicUrl || "";
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({ username, avatar_url: newAvatarUrl })
      .eq("id", user.id);

    if (error) {
      toast.error("บันทึกข้อมูลไม่สำเร็จ");
    } else {
      toast.success("บันทึกข้อมูลสำเร็จ");
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-6 bg-white rounded-md shadow px-6 py-8">
      <h2 className="text-xl font-bold mb-4 text-emerald-700">แก้ไขข้อมูลส่วนตัว</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            {avatarFile
              ? <AvatarImage src={URL.createObjectURL(avatarFile)} />
              : avatarUrl
                ? <AvatarImage src={avatarUrl} />
                : <AvatarFallback>{(profile?.username?.[0] || user.email[0] || "U").toUpperCase()}</AvatarFallback>
            }
          </Avatar>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-2"
              size="sm"
            >
              เลือกรูปโปรไฟล์
            </Button>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            {avatarFile && (
              <div className="text-xs text-gray-500">{avatarFile.name}</div>
            )}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">ชื่อเล่น</label>
          <Input value={username} onChange={e => setUsername(e.target.value)} maxLength={50} required />
        </div>
        <div className="flex gap-2 mt-6">
          <Button type="submit" disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={saving}>
            ย้อนกลับ
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
