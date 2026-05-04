import ReviewCard from "./ReviewCard";

const ReviewsSection = ({ reviews, userData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-[#708A58]/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#2D4F2B]">Customer Reviews</h2>
        <span className="text-gray-500">{reviews.length} reviews</span>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
