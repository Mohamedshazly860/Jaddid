import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-gradient-to-br from-[#FFF1CA]/30 to-white p-5 rounded-xl border-l-4 border-[#708A58] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {/* Reviewer Name & Date */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-[#2D4F2B]">
                {review.reviewer}
              </h4>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>

            {/* Rating Stars */}
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "text-[#FFB823] fill-[#FFB823]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Review Comment */}
          <p className="text-gray-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
