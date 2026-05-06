import { Star, MapPin, Mail, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// ProfileSidebar.jsx - Fix the location/address mapping

const ProfileSidebar = ({ userData }) => {
  const [imgError, setImgError] = useState(false);

  // Handle null/undefined userData
  if (!userData) {
    return (
      <div className="lg:w-80 w-full">
        <div className="bg-gradient-to-br from-[#708A58] to-[#2D4F2B] rounded-2xl shadow-lg p-6">
          <div className="text-center text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-80 w-full">
      <div className="bg-gradient-to-br from-[#708A58] to-[#2D4F2B] rounded-2xl shadow-lg p-6">
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={
                imgError || !userData?.profileImage
                  ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.email || 'user'}`
                  : userData.profileImage.startsWith("http")
                  ? userData.profileImage
                  : `http://localhost:8000${userData.profileImage}`
              }
              alt={userData?.name || "User"}
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={() => setImgError(true)}
              key={userData?.profileImage}
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#FFB823] rounded-full border-4 border-white"></div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {userData?.name || "User"}
          </h2>
          <p className="text-[#FFF1CA] text-sm mb-4">
            Member since {userData?.joinDate || "Recently"}
          </p>

          {/* Rating Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Star className="w-5 h-5 text-[#FFB823] fill-[#FFB823] mr-2" />
            <span className="text-white font-semibold">
              {userData?.rating || 0} / 5.0
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          {userData?.address && (
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              text={userData.address}
            />
          )}
          {userData?.email && (
            <InfoItem icon={<Mail className="w-5 h-5" />} text={userData.email} />
          )}
          {userData?.phone && (
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              text={userData.phone}
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
          <StatBox label="Total Sales" value={userData?.totalSales || 0} />
          <StatBox
            label="Response Rate"
            value={userData?.responseRate || "N/A"}
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

  // Simple check: if no auth user or no userData, don't show
  if (!authUser || !userData) {
    return null;
  }

  // Compare IDs first (most reliable)
  const authUserId = authUser?.id || authUser?.user_id || null;
  const dataUserId = userData?.id || null;
  
  if (authUserId && dataUserId && authUserId === dataUserId) {
    return (
      <button
        onClick={() => navigate("/profile/edit")}
        className="w-full mt-6 bg-[#FFB823] hover:bg-[#FFB823]/90 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
      >
        Update Profile
      </button>
    );
  }

  // Compare emails as fallback (case-insensitive)
  const authEmail = authUser?.email ? String(authUser.email).toLowerCase() : null;
  const dataEmail = userData?.email ? String(userData.email).toLowerCase() : null;
  
  if (authEmail && dataEmail && authEmail === dataEmail) {
    return (
      <button
        onClick={() => navigate("/profile/edit")}
        className="w-full mt-6 bg-[#FFB823] hover:bg-[#FFB823]/90 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
      >
        Update Profile
      </button>
    );
  }

  return null;
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
