import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Star,
  Leaf,
  Plus,
  Grid3x3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import marketplaceService from "@/services/marketplaceService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MarketplacePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("-created_at");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Helper function to add item to cart
  const handleAddToCart = async (item, itemType) => {
    if (!user) {
      toast({
        title: isArabic ? "يجب تسجيل الدخول" : "Login Required",
        description: isArabic
          ? "يرجى تسجيل الدخول لإضافة العناصر إلى السلة"
          : "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const cartData =
        itemType === "product"
          ? { product_id: item.id, quantity: 1 }
          : { material_listing_id: item.id, quantity: 1 };

      await marketplaceService.cart.addItem(cartData);
      toast({
        title: isArabic ? "تم الإضافة" : "Success",
        description: isArabic
          ? "تمت إضافة العنصر إلى السلة"
          : "Item added to cart",
      });
    } catch (error) {
      console.error("Cart error:", error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.detail ||
          (isArabic
            ? "فشل في إضافة العنصر إلى السلة"
            : "Failed to add to cart"),
        variant: "destructive",
      });
    }
  };

  console.log("MarketplacePage rendering, loading:", loading);

  useEffect(() => {
    console.log("MarketplacePage useEffect triggered");
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const fetchData = async () => {
    console.log("Fetching marketplace data...");
    try {
      setLoading(true);
      const params = {
        ordering: sortBy,
        search: searchTerm,
      };
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      console.log("Making API calls...");
      const [productsRes, materialsRes, categoriesRes] = await Promise.all([
        marketplaceService.products.getAll(params).catch((err) => {
          console.log("Products API error:", err.message, err.response?.status);
          return { data: { results: [] } };
        }),
        marketplaceService.materialListings.getAll(params).catch((err) => {
          console.log(
            "Materials API error:",
            err.message,
            err.response?.status
          );
          return { data: { results: [] } };
        }),
        marketplaceService.categories.getAll().catch((err) => {
          console.log(
            "Categories API error:",
            err.message,
            err.response?.status
          );
          return { data: [] };
        }),
      ]);

      console.log("API responses received:", {
        products: productsRes.data,
        materials: materialsRes.data,
        categories: categoriesRes.data,
      });

      setProducts(productsRes.data.results || productsRes.data || []);
      setMaterials(materialsRes.data.results || materialsRes.data || []);

      // Ensure categories is always an array
      const categoriesData = categoriesRes.data;
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else if (
        categoriesData?.results &&
        Array.isArray(categoriesData.results)
      ) {
        setCategories(categoriesData.results);
      } else {
        setCategories([]);
      }

      console.log("State updated successfully");
    } catch (error) {
      console.error("Marketplace fetch error:", error);
      // Don't show error toast, just set empty arrays
      setProducts([]);
      setMaterials([]);
      setCategories([]);
    } finally {
      setLoading(false);
      console.log("Loading complete");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleFavorite = async (id, type) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    try {
      if (type === "product") {
        await marketplaceService.products.toggleFavorite(id);
        // Update local state immediately
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === id ? { ...p, is_favorited: !p.is_favorited } : p
          )
        );
      } else {
        await marketplaceService.materialListings.toggleFavorite(id);
        // Update local state immediately
        setMaterials((prevMaterials) =>
          prevMaterials.map((m) =>
            m.id === id ? { ...m, is_favorited: !m.is_favorited } : m
          )
        );
      }
      toast({
        title: "Success",
        description: "Favorite updated successfully",
      });
    } catch (error) {
      console.error("Toggle favorite error:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite",
        variant: "destructive",
      });
    }
  };

  const ProductCard = ({ item, type = "product" }) => {
    let imageUrl = null;
    if (type === "product") {
      console.log("PRODUCT:", item.title);
      console.log("Full product object:", item);
      console.log("images array:", item.images);
      console.log("first image:", item.images?.[0]);
      console.log("product_images:", item.product_images);
      console.log("primary_image:", item.primary_image);
      imageUrl =
        item.images?.[0]?.image ||
        item.product_images?.[0]?.image ||
        item.primary_image;
      console.log("final URL:", imageUrl);
    } else {
      // Material listings might have images array OR primary_image field
      imageUrl = item.images?.[0]?.image || item.primary_image;
      console.log("Material:", item.title, "Image URL:", imageUrl);
    }

    return (
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 card-hover border-sage/20">
        <div className="relative h-48 bg-gradient-to-br from-cream/50 to-sage/10">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={
                  type === "material" && isArabic && item.material?.name_ar
                    ? item.material.name_ar
                    : item.title
                }
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  e.target.style.display = "none";
                }}
                onLoad={() => console.log("Image loaded:", imageUrl)}
              />
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ display: "none" }}
              >
                <Package className="w-16 h-16 text-sage/40" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-sage/40" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
            onClick={() => handleToggleFavorite(item.id, type)}
          >
            <Heart
              className="w-5 h-5"
              fill={item.is_favorited ? "#FFB823" : "none"}
              stroke={item.is_favorited ? "#FFB823" : "currentColor"}
            />
          </Button>
          {item.status === "draft" && (
            <Badge
              className="absolute top-2 left-2 bg-orange text-white"
              variant="secondary"
            >
              Draft
            </Badge>
          )}
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1 text-forest">
            {type === "material" && isArabic && item.material?.name_ar
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
              <span className="text-2xl font-bold text-forest">
                ${type === "material" ? item.price_per_unit : item.price}
              </span>
              {type === "material" && (
                <span className="text-sm text-muted-foreground">
                  {isArabic ? `لكل ${item.unit}` : `per ${item.unit}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 fill-orange text-orange" />
                <span>{item.favorites_count || "0"}</span>
              </div>
              <span>•</span>
              <span>
                {item.quantity || 0} {isArabic ? "متبقي" : "left"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {isArabic ? "بواسطة" : "By"} {item.seller_name}
              </span>
              <Badge variant="outline" className="border-sage/50 text-forest">
                {item.condition}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            asChild
            className="flex-1 bg-forest hover:bg-forest/80 hover:shadow-lg transition-all text-white"
          >
            <Link to={`/marketplace/${type}/${item.id}`}>
              {isArabic ? "عرض التفاصيل" : "View Details"}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart(item, type);
            }}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  console.log(
    "Rendering MarketplacePage - products:",
    products.length,
    "materials:",
    materials.length,
    "loading:",
    loading
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-hero border-b border-sage/20 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage/10 text-forest rounded-full text-sm font-semibold mb-4">
              <Leaf className="w-4 h-4" />
              {isArabic ? "تسوق مستدام" : "Sustainable Shopping"}
            </div>
            <h1
              className={`text-4xl md:text-5xl font-bold text-gradient mb-4 ${
                isArabic ? "font-arabic" : ""
              }`}
            >
              {isArabic ? "سوق جديد" : "Jaddid Marketplace"}
            </h1>
            <p
              className={`text-lg text-muted-foreground ${
                isArabic ? "font-arabic" : ""
              }`}
            >
              {isArabic
                ? "اكتشف منتجات صديقة للبيئة ومواد معاد تدويرها"
                : "Discover eco-friendly products and recycled materials"}
            </p>
          </div>

          {/* Search & Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
            <div className="flex gap-2 w-full md:w-auto flex-wrap justify-center">
              {isAuthenticated && (
                <Button
                  className="bg-orange hover:bg-orange/80 hover:shadow-lg transition-all text-white"
                  onClick={() => navigate("/marketplace/sell")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isArabic ? "بيع عنصر" : "Sell Item"}
                </Button>
              )}
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/my-listings")
                    : navigate("/login")
                }
              >
                <Package className="w-4 h-4 mr-2" />
                {isArabic ? "قوائمي" : "My Listings"}
              </Button>
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/favorites")
                    : navigate("/login")
                }
              >
                <Heart className="w-4 h-4 mr-2" />
                {isArabic ? "المفضلة" : "Favorites"}
              </Button>
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/cart")
                    : navigate("/login")
                }
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isArabic ? "السلة" : "Cart"}
              </Button>
              <Button
                variant="outline"
                className="border-sage/50 hover:bg-sage/30 hover:border-sage transition-colors"
                onClick={() =>
                  isAuthenticated
                    ? navigate("/marketplace/orders")
                    : navigate("/login")
                }
              >
                <Package className="w-4 h-4 mr-2" />
                {isArabic ? "الطلبات" : "Orders"}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  isArabic
                    ? "ابحث عن منتجات ومواد..."
                    : "Search products, materials..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-sage/30 focus:border-sage"
              />
            </div>
            <Button
              type="submit"
              className="bg-forest hover:bg-forest/80 text-white"
            >
              {isArabic ? "بحث" : "Search"}
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] border-sage/30">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={isArabic ? "التصنيف" : "Category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {isArabic ? "كل التصنيفات" : "All Categories"}
              </SelectItem>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {isArabic ? cat.name_ar || cat.name : cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px] border-sage/30">
              <SelectValue placeholder={isArabic ? "ترتيب حسب" : "Sort By"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">
                {isArabic ? "الأحدث أولاً" : "Newest First"}
              </SelectItem>
              <SelectItem value="created_at">
                {isArabic ? "الأقدم أولاً" : "Oldest First"}
              </SelectItem>
              <SelectItem value="price">
                {isArabic ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
              </SelectItem>
              <SelectItem value="-price">
                {isArabic ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
              </SelectItem>
              <SelectItem value="-average_rating">
                {isArabic ? "الأعلى تقييماً" : "Highest Rated"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
            <p className="mt-4 text-muted-foreground">
              {isArabic
                ? "جاري تحميل المنتجات..."
                : "Loading marketplace items..."}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="all">
                {isArabic ? "كل العناصر" : "All Items"}
              </TabsTrigger>
              <TabsTrigger value="products">
                {isArabic ? "منتجات" : "Products"} ({products.length})
              </TabsTrigger>
              <TabsTrigger value="materials">
                {isArabic ? "مواد خام" : "Materials"} ({materials.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {products.length === 0 && materials.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "لا توجد عناصر" : "No items found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isArabic
                      ? "حاول تعديل الفلاتر أو كلمات البحث"
                      : "Try adjusting your filters or search terms"}
                  </p>
                  {isAuthenticated && (
                    <div className="flex gap-4 justify-center">
                      <Button
                        className="bg-orange hover:bg-orange/80 text-white"
                        onClick={() =>
                          navigate("/marketplace/sell?type=product")
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {isArabic
                          ? "أضف منتجك الأول"
                          : "Add Your First Product"}
                      </Button>
                      <Button
                        className="bg-forest hover:bg-forest/80 text-white"
                        onClick={() =>
                          navigate("/marketplace/sell?type=material")
                        }
                      >
                        <Leaf className="w-4 h-4 mr-2" />
                        {isArabic
                          ? "أضف مادتك الأولى"
                          : "Add Your First Material"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {products.length > 0 && (
                    <div>
                      <h2
                        className={`text-2xl font-bold text-forest mb-4 ${
                          isArabic ? "font-arabic" : ""
                        }`}
                      >
                        {isArabic ? "المنتجات" : "Products"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            item={product}
                            type="product"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {materials.length > 0 && (
                    <div>
                      <h2
                        className={`text-2xl font-bold text-forest mb-4 ${
                          isArabic ? "font-arabic" : ""
                        }`}
                      >
                        {isArabic ? "المواد الخام" : "Materials"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {materials.map((material) => (
                          <ProductCard
                            key={material.id}
                            item={material}
                            type="material"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="products">
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "لا توجد منتجات" : "No products found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isAuthenticated
                      ? isArabic
                        ? "كن أول من يضيف منتج!"
                        : "Be the first to add a product!"
                      : isArabic
                      ? "تفقد لاحقاً للمنتجات الجديدة"
                      : "Check back later for new products"}
                  </p>
                  {isAuthenticated && (
                    <Button
                      className="bg-orange hover:bg-orange/80 text-white"
                      onClick={() => navigate("/marketplace/sell?type=product")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isArabic ? "أضف منتج" : "Add Product"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      type="product"
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials">
              {materials.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "لا توجد مواد خام" : "No materials found"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isAuthenticated
                      ? isArabic
                        ? "كن أول من يضيف مادة خام!"
                        : "Be the first to add a material!"
                      : isArabic
                      ? "تفقد لاحقاً للمواد الجديدة"
                      : "Check back later for new materials"}
                  </p>
                  {isAuthenticated && (
                    <Button
                      className="bg-forest hover:bg-forest/80 text-white"
                      onClick={() =>
                        navigate("/marketplace/sell?type=material")
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isArabic ? "أضف مادة خام" : "Add Material"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {materials.map((material) => (
                    <ProductCard
                      key={material.id}
                      item={material}
                      type="material"
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
