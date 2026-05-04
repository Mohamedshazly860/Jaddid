import { Star, MapPin, Mail, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// ProfileSidebar.jsx - Fix the location/address mapping

const ProfileSidebar = ({ userData }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="lg:w-80 w-full">
      <div className="bg-gradient-to-br from-[#708A58] to-[#2D4F2B] rounded-2xl shadow-lg p-6">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={
                imgError || !userData.profileImage
                  ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
                  : userData.profileImage.startsWith("http")
                  ? userData.profileImage
                  : `http://localhost:8000${userData.profileImage}` // Prepend your backend URL if it's a relative path
              }
              alt={userData.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={() => setImgError(true)}
              key={userData.profileImage}
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#FFB823] rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {userData.name}
          </h2>
          <p className="text-[#FFF1CA] text-sm mb-4">
            Member since {userData.joinDate}
          </p>

          {/* Rating Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Star className="w-5 h-5 text-[#FFB823] fill-[#FFB823] mr-2" />
            <span className="text-white font-semibold">
              {userData.rating || 0} / 5.0
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          {/* FIX: Use address instead of location */}
          {userData.address && (
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              text={userData.address}
            />
          )}
          <InfoItem icon={<Mail className="w-5 h-5" />} text={userData.email} />
          {userData.phone && (
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              text={userData.phone}
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
          <StatBox label="Total Sales" value={userData.totalSales || 0} />
          <StatBox
            label="Response Rate"
            value={userData.responseRate || "N/A"}
          />
        </div>

        {/* Update Profile Button */}
        <UpdateButton userData={userData} />
      </div>
    </div>
  );
};

const UpdateButton = ({ userData }) => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Helper to extract ID consistently
  const extractId = (u) => {
    if (!u) return null;
    const id = u.id ?? u.user_id ?? u.pk ?? u.uuid ?? u.email?.split("@")[0];
    return id ? String(id) : null;
  };

  // --- CRITICAL FIX: Actually call the function to define these variables ---
  const authId = extractId(authUser);
  const profileId = extractId(userData);

  const emailsMatch =
    authUser?.email && userData?.email
      ? String(authUser.email).toLowerCase() ===
        String(userData.email).toLowerCase()
      : false;

  // Use the variables defined above
  const idsMatch = authId && profileId ? authId === profileId : false;

  // Debugging log to see why it might still be failing
  console.log("Button Check:", { authId, profileId, idsMatch, emailsMatch });

  // Only show if IDs match OR Emails match
  if (!authUser || (!idsMatch && !emailsMatch)) return null;

  return (
    <button
      onClick={() => navigate("/profile/edit")}
      className="w-full mt-6 bg-[#FFB823] hover:bg-[#FFB823]/90 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
    >
      Update Profile
    </button>
  );
};

// Info Item Component
const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-white/90">
    <div className="text-[#FFF1CA]">{icon}</div>
    <span className="text-sm">{text}</span>
  </div>
);

// Stat Box Component
const StatBox = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-[#FFF1CA]">{label}</div>
  </div>
);

export default ProfileSidebar;
