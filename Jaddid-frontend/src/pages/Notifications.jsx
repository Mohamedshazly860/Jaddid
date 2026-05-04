import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import communityService from "@/services/communityService";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () =>
      communityService.notifications.getAll({ page }).then((res) => res.data),
    enabled: !!user,
  });

  const notifications = data?.results || [];
  const hasNext = data?.next;
  const hasPrev = data?.previous;

  const markRead = useMutation({
    mutationFn: async (ids) => {
      const idArray = Array.isArray(ids) ? ids : [ids];
      await Promise.all(
        idArray.map((id) => communityService.notifications.markAsRead(id))
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const handleAddReview = (notification) => {
    markRead.mutate([notification.id]);

    // تمرير البيانات عبر state مع order_item_id
    navigate(`/review-product/${notification.product_id}`, {
      state: {
        order_id: notification.order_id,
        product_id: notification.product_id,
        order_item_id: notification.order_item_id,
      },
    });
  };

  // ✅ شرط الإشعار المسلَّم
  const isDeliveredNotification = (n) =>
    n.type === "order_status" &&
    n.order_id &&
    n.product_id &&
    (n.title_en?.toLowerCase().includes("delivered") ||
      n.title_ar?.includes("تم تسليم"));

  if (isLoading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 text-center">
          {language === "en" ? "Loading..." : "جارٍ التحميل..."}
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto max-w-2xl p-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-forest" />
                {language === "en" ? "Notifications" : "الإشعارات"}
              </CardTitle>
              <div className="flex gap-2">
                {notifications.some((n) => !n.is_read) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      markRead.mutate(
                        notifications.filter((n) => !n.is_read).map((n) => n.id)
                      )
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {language === "en" ? "Mark all read" : "تحديد الكل كمقروء"}
                  </Button>
                )}
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <BellOff className="mx-auto mb-2 w-16 h-16 opacity-30" />
                    {language === "en" ? "No notifications" : "لا توجد إشعارات"}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                        !n.is_read ? "bg-orange/5 border-l-4 border-orange" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4
                            className={`font-medium mb-1 ${
                              !n.is_read ? "text-forest" : ""
                            }`}
                          >
                            {language === "en" ? n.title_en : n.title_ar}
                          </h4>
                          <p
                            className={`text-sm leading-relaxed ${
                              !n.is_read
                                ? "font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {language === "en" ? n.msg_en : n.msg_ar}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(n.created_at).toLocaleString(
                              language === "en" ? "en-US" : "ar-EG",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>

                          {/* ✅ زر Add Review للطلبات المُسلّمة */}
                          {isDeliveredNotification(n) && (
                            <Button
                              size="sm"
                              className="mt-3 bg-forest hover:bg-forest/90 text-white"
                              onClick={() => handleAddReview(n)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              {language === "en" ? "Add Review" : "إضافة تقييم"}
                            </Button>
                          )}
                        </div>

                        {!n.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markRead.mutate([n.id])}
                            className="flex-shrink-0 hover:bg-forest/10"
                          >
                            <CheckCircle className="w-4 h-4 text-forest" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-center gap-2 mt-4">
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
