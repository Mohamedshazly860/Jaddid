// Favorites/Wishlist Page
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Package, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import marketplaceService from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Helper function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as-is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it already starts with /media, prepend the base URL
    if (imagePath.startsWith("/media")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    // Otherwise, assume it needs /media prefix
    return `http://127.0.0.1:8000/media/${imagePath}`;
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await marketplaceService.favorites.getAll();
      console.log("Favorites response:", response.data);
      // Handle both paginated and non-paginated responses
      const favoritesData = response.data.results || response.data || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      // Debug: Log image paths
      if (favoritesData.length > 0) {
        const firstItem =
          favoritesData[0].product || favoritesData[0].material_listing;
        console.log("First favorite item images:", firstItem?.images);
        console.log("First image path:", firstItem?.images?.[0]?.image);
      }
    } catch (error) {
      console.error("Favorites fetch error:", error);
      setFavorites([]);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "فشل تحميل المفضلات"
          : "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    // Optimistically update UI immediately
    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.id !== id)
    );

    try {
      await marketplaceService.favorites.remove(id);
      toast({
        title: isArabic ? "تمت الإزالة" : "Removed",
        description: isArabic
          ? "تم إزالة العنصر من المفضلات"
          : "Item removed from favorites",
      });
    } catch (error) {
      // On error, revert by refetching
      fetchFavorites();
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "فشلت إزالة العنصر"
          : "Failed to remove favorite",
        variant: "destructive",
      });
    }
  };

  const addToCart = async (item) => {
    try {
      const cartData = item.product
        ? { product_id: item.product.id, quantity: 1 }
        : { material_listing_id: item.material_listing.id, quantity: 1 };

      await marketplaceService.cart.addItem(cartData);
      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic
          ? "تمت إضافة العنصر إلى السلة"
          : "Item added to cart",
      });
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "فشلت إضافة العنصر إلى السلة"
          : "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 animate-pulse text-orange" />
          <p className="text-gray-600">
            {isArabic ? "جاري تحميل المفضلات..." : "Loading favorites..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header with Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isArabic ? "العودة إلى السوق" : "Back to Marketplace"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className={`text-3xl font-bold flex items-center gap-2 ${
              isArabic ? "font-arabic" : ""
            }`}
          >
            <Heart className="w-8 h-8 text-orange" fill="#FFB823" />
            {isArabic ? "مفضلاتي" : "My Favorites"}
          </h1>
          <p className="text-gray-600">
            {favorites.length} {isArabic ? "عنصر" : "items"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold mb-2">
                {isArabic ? "لا توجد مفضلات بعد" : "No favorites yet"}
              </p>
              <p className="text-gray-500 mb-6">
                {isArabic
                  ? "ابدأ بإضافة عناصر إلى قائمة مفضلاتك"
                  : "Start adding items to your wishlist"}
              </p>
              <Button asChild>
                <Link to="/marketplace">
                  {isArabic ? "تصفح السوق" : "Browse Marketplace"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const item = favorite.product || favorite.material_listing;
              const itemType = favorite.product ? "product" : "material";
              // Handle images for both products and materials
              const imageUrl =
                itemType === "product"
                  ? item?.images?.[0]?.image ||
                    item?.product_images?.[0]?.image ||
                    item?.primary_image
                  : item?.images?.[0]?.image || item?.primary_image;

              console.log(
                `${itemType} in favorites:`,
                item.title,
                "Image:",
                imageUrl
              );

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={
                            itemType === "material" &&
                            isArabic &&
                            item.material?.name_ar
                              ? item.material.name_ar
                              : item.title
                          }
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Image failed to load:", imageUrl);
                            e.target.style.display = "none";
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <Trash2 className="w-5 h-5 text-orange" />
                    </Button>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {itemType === "material" &&
                      isArabic &&
                      item.material?.name_ar
                        ? item.material.name_ar
                        : item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">
                          $
                          {itemType === "material"
                            ? item.price_per_unit
                            : item.price}
                        </span>
                        {itemType === "material" && (
                          <span className="text-sm text-gray-500">
                            per {item.unit}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {isArabic ? "بواسطة" : "By"} {item.seller_name}
                        </span>
                        <Badge variant="outline">{item.condition}</Badge>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/marketplace/${itemType}/${item.id}`}>
                        {isArabic ? "عرض التفاصيل" : "View Details"}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(favorite)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
