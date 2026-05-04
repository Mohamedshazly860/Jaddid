import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function EditProfile() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const extractId = (u) =>
    u?.id ?? u?.user_id ?? u?.pk ?? u?.uuid ?? u?.email?.split("@")[0];
  const authId = extractId(authUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await userService.getCurrentUser();
        const data = res.data ?? res;
        setFirstName(data.first_name || data.firstName || "");
        setLastName(data.last_name || data.lastName || "");
        const prof = data.profile ?? data.profiles ?? {};
        setPhone(prof.Phone || prof.phone || "");
        setAddress(prof.address || "");
        setBio(prof.bio || "");
        setProfileImageUrl(prof.profile_image || data.profile_image || "");
        setPreviewUrl(prof.profile_image || data.profile_image || "");
      } catch (err) {
        console.error(err);
        setError(err.response?.data || err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setProfileImageFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setProfileImageUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        profile: {
          phone: phone,
          address: address,
          bio: bio,
        },
      };

      console.log("📤 Sending payload:", payload);
      const updateRes = await userService.updateCurrentUserPut(payload);
      console.log("✅ Update response:", updateRes.data);

      if (profileImageFile) {
        const imageFd = new FormData();
        imageFd.append("profile_image", profileImageFile);
        console.log("📤 Uploading image:", profileImageFile.name);
        const imageRes = await userService.uploadProfileImage(imageFd);
        console.log("✅ Image response:", imageRes.data);
      }

      // FIX: Add a small delay then force reload
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate with state to trigger reload
      navigate(`/profile/${authId}`, {
        replace: true,
        state: { reload: true },
      });

      // Or force a full page reload (simpler but less elegant)
      // window.location.href = `/profile/${authId}`;
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err);
      setError(err.response?.data || "Update failed");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6">Loading...</div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-12 pt-12">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-forest px-6 py-5">
            <h2 className="text-white text-2xl font-semibold">Edit Profile</h2>
            <p className="text-white/90 text-sm mt-1">
              Update your account and profile information
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 text-red-600">{JSON.stringify(error)}</div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div className="md:grid md:grid-cols-2 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-sage/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="mt-3 md:mt-0">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-sage/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-sage/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-sage/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-sage/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage"
                  rows={5}
                />
              </div>

              <div className="md:flex md:items-center md:gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Profile Image (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="mt-1"
                  />
                </div>
                <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary bg-forest text-white px-4 py-2 rounded-lg"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${authId}`)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
