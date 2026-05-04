import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingCart,
  Share2,
  Flag,
  MessageSquare,
  MapPin,
  Star,
  Clock,
  Eye,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import marketplaceService from "@/services/marketplaceService";
import userService from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ProductDetailPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchItemDetails();
  }, [id, type]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      let itemRes, reviewsRes;

      if (type === "product") {
        itemRes = await marketplaceService.products.getById(id);
        reviewsRes = await marketplaceService.products.getReviews(id);
      } else {
        itemRes = await marketplaceService.materialListings.getById(id);
        reviewsRes = await marketplaceService.materialListings.getReviews(id);
      }

      setItem(itemRes.data);

      const data = reviewsRes.data;
      const actualReviewsArray = data.results
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
      setReviews(actualReviewsArray);
      // Fetch seller details after getting item
      if (itemRes.data) {
        fetchSellerDetails(itemRes.data);
      }
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "فشل تحميل تفاصيل العنصر"
          : "Failed to load item details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerDetails = async (itemData) => {
    try {
      setSellerLoading(true);

      // Extract seller ID from item data
      const sellerId =
        itemData.seller?.id || itemData.seller_id || itemData.seller;

      if (!sellerId) {
        console.warn("No seller ID found in item data");
        return;
      }

      console.log("Fetching seller details for ID:", sellerId);

      // Fetch seller profile from user service
      const sellerRes = await userService.getUserProfile(sellerId);
      console.log("Seller details:", sellerRes.data);
      setSeller(sellerRes.data);
    } catch (error) {
      console.error("Failed to fetch seller details:", error);
      // Don't show error toast for seller details as it's not critical
    } finally {
      setSellerLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: isArabic ? "تسجيل الدخول مطلوب" : "Login Required",
        description: isArabic
          ? "يرجى تسجيل الدخول لإضافة العناصر إلى السلة"
          : "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      console.log("Adding to cart:", { type, id });
      const cartData =
        type === "product"
          ? { product_id: id, quantity: 1 }
          : { material_listing_id: id, quantity: 1 };

      console.log("Cart data:", cartData);
      const response = await marketplaceService.cart.addItem(cartData);
      console.log("Cart response:", response);

      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic
          ? "تمت إضافة العنصر إلى السلة"
          : "Item added to cart",
      });
    } catch (error) {
      console.error("Cart error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.detail ||
          error.response?.data?.error ||
          error.message ||
          (isArabic ? "فشل الإضافة إلى السلة" : "Failed to add to cart"),
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: isArabic ? "تسجيل الدخول مطلوب" : "Login Required",
        description: isArabic
          ? "يرجى تسجيل الدخول لإضافة العناصر إلى المفضلة"
          : "Please login to add items to favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      if (type === "product") {
        await marketplaceService.products.toggleFavorite(id);
      } else {
        await marketplaceService.materialListings.toggleFavorite(id);
      }
      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic ? "تم تحديث المفضلة" : "Favorite updated",
      });
      fetchItemDetails();
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "يرجى تسجيل الدخول لإضافة المفضلة"
          : "Please login to add favorites",
        variant: "destructive",
      });
    }
  };

  const getIdFrom = (u) => {
    if (!u) return null;
    return (
      u.id ??
      u.pk ??
      u.user_id ??
      u._id ??
      u.uuid ??
      u.sub ??
      (u.email && u.email.toLowerCase())
    );
  };

  const isOwner = () => {
    if (!user || !item) return false;
    const authId = String(getIdFrom(user));
    const ownerId = String(
      item.owner ??
        item.owner_id ??
        item.seller_id ??
        item.user ??
        item.seller?.id ??
        item.seller?.pk ??
        item.seller?.user_id ??
        item.seller
    );
    return authId && ownerId && authId === ownerId;
  };

  const handleDelete = async () => {
    if (!isOwner()) return;
    const ok = window.confirm(
      isArabic
        ? "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
        : "Are you sure you want to delete this item? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setLoading(true);
      if (type === "product") {
        await userService.deleteProduct(id);
      } else {
        await userService.deleteMaterialListing(id);
      }
      toast({
        title: isArabic ? "تم الحذف" : "Deleted",
        description: isArabic
          ? "تم حذف العنصر بنجاح"
          : "Item deleted successfully",
      });
      navigate("/marketplace/my-listings");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.detail ||
          error.message ||
          (isArabic ? "فشل الحذف" : "Failed to delete"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/media")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">
            {isArabic ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            {isArabic ? "العنصر غير موجود" : "Item not found"}
          </p>
          <Button onClick={() => navigate("/marketplace")}>
            {isArabic ? "العودة إلى السوق" : "Back to Marketplace"}
          </Button>
        </div>
      </div>
    );
  }

  const images =
    type === "product"
      ? item.images || []
      : item.images ||
        (item.primary_image ? [{ image: item.primary_image }] : []);
  const currentImage = images[selectedImage]?.image || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isArabic ? "العودة إلى السوق" : "Back to Marketplace"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={
                    type === "material" && isArabic && item.material?.name_ar
                      ? item.material.name_ar
                      : item.title
                  }
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image)}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                >
                  {item.status}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={item.is_favorited ? "red" : "none"}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {type === "material" && isArabic && item.material?.name_ar
                  ? item.material.name_ar
                  : item.title}
              </h1>
              <p className="text-gray-600">{item.description}</p>
            </div>

            <Separator />

            {/* Price & Stats */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ${type === "material" ? item.price_per_unit : item.price}
                </span>
                {type === "material" && (
                  <span className="text-lg text-gray-500">
                    {isArabic ? `لكل ${item.unit}` : `per ${item.unit}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-semibold">
                        {item.average_rating || "0.0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({item.reviews_count} {isArabic ? "تقييم" : "reviews"})
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-gray-500" />
                      <span className="text-xl font-semibold">
                        {item.views_count}
                      </span>
                      <span className="text-sm text-gray-500">
                        {isArabic ? "مشاهدة" : "views"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isArabic ? "تفاصيل العنصر" : "Item Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {isArabic ? "الحالة:" : "Condition:"}
                    </span>
                    <Badge variant="outline">{item.condition}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {isArabic ? "الكمية المتاحة:" : "Quantity Available:"}
                    </span>
                    <span className="font-semibold">
                      {item.quantity}{" "}
                      {item.unit || (isArabic ? "وحدة" : "units")}
                    </span>
                  </div>
                  {item.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isArabic ? "نوع المادة:" : "Material Type:"}
                      </span>
                      <span className="font-semibold">
                        {item.material_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {item.location}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Info - Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isArabic ? "معلومات البائع" : "Seller Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sellerLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : seller ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={seller.profile_picture} />
                          <AvatarFallback className="text-lg">
                            {seller.first_name?.[0]}
                            {seller.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {seller.first_name} {seller.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {seller.role === "seller"
                              ? isArabic
                                ? "بائع"
                                : "Seller"
                              : seller.role === "buyer"
                              ? isArabic
                                ? "مشتري"
                                : "Buyer"
                              : seller.role}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{seller.email}</span>
                        </div>

                        {seller.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {seller.phone}
                            </span>
                          </div>
                        )}

                        {seller.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {seller.address}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {isArabic ? "عضو منذ" : "Member since"}{" "}
                            {new Date(
                              seller.created_at || seller.date_joined
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {isArabic ? "راسل البائع" : "Contact Seller"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {item.seller_name || (isArabic ? "البائع" : "Seller")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.seller_email ||
                            (isArabic
                              ? "معلومات غير متاحة"
                              : "Information not available")}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isArabic ? "أضف إلى السلة" : "Add to Cart"}
              </Button>

              {isAuthenticated && isOwner() && (
                <Button variant="destructive" size="lg" onClick={handleDelete}>
                  {isArabic ? "حذف" : "Delete"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? "تقييمات العملاء" : "Customer Reviews"}
            </CardTitle>
            <CardDescription>
              {reviews.length} {isArabic ? "تقييم" : "reviews"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {isArabic ? "لا توجد تقييمات بعد" : "No reviews yet"}
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold">
                            {review.reviewer_name}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold mb-1">{review.title}</p>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
