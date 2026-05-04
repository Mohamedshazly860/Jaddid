import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Star, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import communityService from "@/services/communityService";
import api from "@/services/api";
import { toast } from "sonner";

export default function ReviewProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { language } = useLanguage();

  const { order_id, product_id } = location.state || {};

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!order_id || !product_id) {
      toast.error(
        language === "en"
          ? "Invalid review data. Please try again."
          : "بيانات التقييم غير مكتملة. حاول مرة أخرى."
      );
      navigate("/notifications");
    }
  }, [user, order_id, product_id, navigate, language]);

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["product", product_id],
    queryFn: () =>
      api.get(`/marketplace/products/${product_id}/`).then((r) => r.data),
    enabled: !!product_id,
    onError: () => {
      toast.error(language === "en" ? "Product not found" : "المنتج غير موجود");
      navigate("/notifications");
    },
  });

  // ✅ التحقق من وجود review سابق لنفس المنتج والطلب
  const { data: existingReview, isLoading: checkingReview } = useQuery({
    queryKey: ["existing-review", product_id, order_id],
    queryFn: async () => {
      try {
        const response = await api.get("/community/reviews/", {
          params: {
            product_id,
            order_id,
          },
        });
        return response.data?.results?.[0] || null;
      } catch (error) {
        console.log("No existing review found");
        return null;
      }
    },
    enabled: !!product_id && !!order_id,
  });

  // ✅ إذا كان هناك review موجود، اعرض رسالة ورجّع المستخدم
  useEffect(() => {
    if (existingReview && !checkingReview) {
      toast.info(
        language === "en"
          ? "You have already reviewed this product"
          : "لقد قمت بتقييم هذا المنتج من قبل",
        { duration: 3000 }
      );
      setTimeout(() => navigate("/notifications"), 2000);
    }
  }, [existingReview, checkingReview, language, navigate]);

  const createReview = useMutation({
    mutationFn: (data) => communityService.reviews.create(data),
    onSuccess: (response) => {
      console.log("✅ Review submission successful:", response);
      qc.invalidateQueries({ queryKey: ["reviews"] });
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      qc.invalidateQueries({ queryKey: ["product", product_id] });

      toast.success(
        language === "en"
          ? "Review submitted successfully!"
          : "تم إرسال التقييم بنجاح!",
        { duration: 3000 }
      );

      setTimeout(() => navigate("/notifications"), 1500);
    },
    onError: (error) => {
      console.error("❌ Review submission error:", error);
      console.error("📦 Error response data:", error.response?.data);
      console.error("📊 Error status:", error.response?.status);

      // استخراج رسالة الخطأ
      let errorMsg =
        language === "en"
          ? "Failed to submit review. Please try again."
          : "فشل إرسال التقييم. حاول مرة أخرى.";

      if (error.response?.data) {
        const data = error.response.data;

        // ✅ التعامل مع خطأ "already reviewed"
        if (
          data.error?.includes("already reviewed") ||
          data.error?.includes("duplicate")
        ) {
          errorMsg =
            language === "en"
              ? "You have already reviewed this product for this order."
              : "لقد قمت بتقييم هذا المنتج لهذا الطلب من قبل.";

          // إعادة التوجيه بعد عرض الرسالة
          setTimeout(() => navigate("/notifications"), 2000);
        } else {
          errorMsg =
            data.error ||
            data.detail ||
            data.message ||
            data.non_field_errors?.[0] ||
            (typeof data === "string" ? data : errorMsg);
        }
      }

      toast.error(errorMsg, { duration: 4000 });
    },
  });

  const handleSubmit = () => {
    console.log("🔘 Submit Review clicked");
    console.log("📝 Comment:", comment);
    console.log("⭐ Rating:", rating);
    console.log("📦 Product ID:", product_id);
    console.log("📦 Order ID:", order_id);

    if (!comment.trim()) {
      toast.error(
        language === "en" ? "Please write a comment" : "من فضلك اكتب تعليقاً"
      );
      return;
    }

    const targetUserId = productData?.seller?.id || productData?.owner?.id;
    console.log("🎯 Target User ID (seller):", targetUserId);

    if (!targetUserId) {
      toast.error(
        language === "en"
          ? "Cannot determine seller. Please try again."
          : "لا يمكن تحديد البائع. حاول مرة أخرى."
      );
      return;
    }

    const reviewData = {
      target_user: targetUserId,
      rating: parseInt(rating),
      comment: comment.trim(),
      product_id: product_id,
      order_id: order_id,
    };

    console.log("📤 Final review data being sent:", reviewData);
    console.log("🔍 Data types check:", {
      target_user: typeof reviewData.target_user,
      rating: typeof reviewData.rating,
      comment: typeof reviewData.comment,
      product_id: typeof reviewData.product_id,
      order_id: typeof reviewData.order_id,
    });

    createReview.mutate(reviewData);
  };

  if (productLoading || checkingReview) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-forest" />
        </div>
        <Footer />
      </>
    );
  }

  if (!productData) {
    return null;
  }

  // ✅ إذا كان هناك review موجود، اعرض رسالة
  if (existingReview) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-xl font-semibold mb-2">
                {language === "en" ? "Already Reviewed" : "تم التقييم مسبقاً"}
              </h2>
              <p className="text-muted-foreground mb-4">
                {language === "en"
                  ? "You have already submitted a review for this product."
                  : "لقد قمت بالفعل بإرسال تقييم لهذا المنتج."}
              </p>
              <Button onClick={() => navigate("/notifications")}>
                {language === "en"
                  ? "Back to Notifications"
                  : "العودة للإشعارات"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10 bg-gray-50">
        <div className="container mx-auto max-w-2xl p-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/notifications")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "en" ? "Back to Notifications" : "رجوع للإشعارات"}
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                {language === "en" ? "Rate Your Experience" : "قيّم تجربتك"}
              </CardTitle>

              <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {productData.primary_image && (
                  <img
                    src={productData.primary_image}
                    alt={productData.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {language === "en"
                      ? productData.title
                      : productData.title_ar || productData.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Order" : "الطلب"}: #
                    {order_id?.slice(0, 8)}...
                  </p>
                  {(productData.seller || productData.owner) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" ? "Seller" : "البائع"}:{" "}
                      {productData.seller?.username ||
                        productData.seller?.email ||
                        productData.owner?.username ||
                        productData.owner?.email}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block mb-2 font-medium">
                  {language === "en" ? "Rating" : "التقييم"}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className={`w-10 h-10 cursor-pointer transition-all ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {rating}/5 {language === "en" ? "stars" : "نجوم"}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block mb-2 font-medium">
                  {language === "en" ? "Your Review" : "تقييمك"}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    language === "en"
                      ? "Share your experience with this product..."
                      : "شارك تجربتك مع هذا المنتج..."
                  }
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!comment.trim() || createReview.isPending}
                className="w-full bg-forest hover:bg-forest/90"
                size="lg"
              >
                {createReview.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "en" ? "Submitting..." : "جارٍ الإرسال..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === "en" ? "Submit Review" : "إرسال التقييم"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
