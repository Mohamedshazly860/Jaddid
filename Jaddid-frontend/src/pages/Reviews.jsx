import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Star, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import communityService from "@/services/communityService";

export default function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { language } = useLanguage();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", page],
    queryFn: () =>
      communityService.reviews.getAll({ page }).then((r) => r.data),
    enabled: !!user,
  });

  const reviews = data?.results || [];
  const hasNext = data?.next;
  const hasPrev = data?.previous;

  const createReview = useMutation({
    mutationFn: () => communityService.reviews.create({ rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      setComment("");
      setRating(5);
    },
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto max-w-3xl p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === "en" ? "Add Review" : "أضف تقييم"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => setRating(s)}
                    className={`cursor-pointer ${
                      s <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  language === "en" ? "Write your review..." : "اكتب تقييمك..."
                }
              />

              <Button
                onClick={() => createReview.mutate()}
                disabled={!comment || createReview.isPending}
              >
                {language === "en" ? "Post Review" : "نشر التقييم"}{" "}
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {isLoading ? (
            <p>
              {language === "en"
                ? "Loading reviews..."
                : "جارٍ تحميل التقييمات..."}
            </p>
          ) : (
            reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex gap-4 p-4">
                  <Avatar>
                    <AvatarFallback>{r.user_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{r.user_name || "User"}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {language === "en" ? "Previous" : "السابق"}
              </Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {language === "en" ? `Page ${page}` : `صفحة ${page}`}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
              >
                {language === "en" ? "Next" : "التالي"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
