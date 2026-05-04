import { Star } from "lucide-react";

const ProfileHeader = ({ userData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-2 border-[#708A58]/10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#2D4F2B] mb-2">About</h1>
          <p className="text-gray-600 leading-relaxed">{userData.bio}</p>
        </div>

        {/* Rating Display - Top Right */}
        <div className="ml-6 bg-gradient-to-br from-[#708A58] to-[#2D4F2B] rounded-xl p-6 text-white min-w-[180px]">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{userData.rating}</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(userData.rating)
                      ? "text-[#FFB823] fill-[#FFB823]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-[#FFF1CA]">
              {userData.totalReviews} reviews
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
