// My Listings Page - View all items created by the user
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Edit, Trash2, Eye, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import marketplaceService from '@/services/marketplaceService';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const MyListingsPage = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isArabic = language === 'ar';

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: isArabic ? 'يجب تسجيل الدخول' : 'Login Required',
        description: isArabic ? 'يرجى تسجيل الدخول لعرض قوائمك' : 'Please login to view your listings',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isArabic, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyListings();
    }
  }, [isAuthenticated]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      console.log('Fetching my listings...');
      
      const [productsRes, materialsRes] = await Promise.all([
        marketplaceService.products.getMyProducts().catch((err) => {
          console.error('Products error:', err);
          return { data: [] };
        }),
        marketplaceService.materialListings.getMyListings().catch((err) => {
          console.error('Materials error:', err);
          return { data: [] };
        }),
      ]);
      
      console.log('Products response:', productsRes.data);
      console.log('Materials response:', materialsRes.data);
      
      // Handle both paginated and non-paginated responses
      const productsData = productsRes.data.results || productsRes.data || [];
      const materialsData = materialsRes.data.results || materialsRes.data || [];
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      
      console.log('Products set:', productsData.length);
      console.log('Materials set:', materialsData.length);
    } catch (error) {
      console.error('Fetch listings error:', error);
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل تحميل قوائمك' : 'Failed to load your listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure you want to delete this item?')) {
      return;
    }

    // Optimistically update UI immediately
    if (type === 'product') {
      setProducts(prev => prev.filter(item => item.id !== id));
    } else {
      setMaterials(prev => prev.filter(item => item.id !== id));
    }

    try {
      if (type === 'product') {
        await marketplaceService.products.delete(id);
      } else {
        await marketplaceService.materialListings.delete(id);
      }
      
      toast({
        title: isArabic ? 'تم الحذف' : 'Deleted',
        description: isArabic ? 'تم حذف العنصر بنجاح' : 'Item deleted successfully',
      });
    } catch (error) {
      // On error, revert by refetching
      fetchMyListings();
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل حذف العنصر' : 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const ItemCard = ({ item, type }) => {
    const imageUrl = type === 'product' 
      ? (item.images?.[0]?.image || item.product_images?.[0]?.image || item.primary_image)
      : (item.images?.[0]?.image || item.primary_image);
    
    console.log(`${type} in my listings:`, item.title, 'Image:', imageUrl);
    
    const title = type === 'material' && isArabic && item.material?.name_ar 
      ? item.material.name_ar 
      : item.title;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  e.target.style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <Badge
            className={`absolute top-2 left-2 ${
              item.status === 'active' ? 'bg-green-500' : 
              item.status === 'sold' ? 'bg-gray-500' : 
              'bg-orange'
            }`}
          >
            {item.status}
          </Badge>
        </div>

        <CardHeader>
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {item.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">
                ${type === 'material' ? item.price_per_unit : item.price}
              </span>
              {type === 'material' && (
                <span className="text-sm text-gray-500">
                  {isArabic ? `لكل ${item.unit}` : `per ${item.unit}`}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {isArabic ? 'الكمية:' : 'Quantity:'} {item.quantity || item.stock_quantity}
              </span>
              <Badge variant="outline">{item.condition}</Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/marketplace/${type}/${item.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              {isArabic ? 'عرض' : 'View'}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/marketplace/sell?edit=${type}&id=${item.id}`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(item.id, type)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 animate-pulse text-green-500" />
          <p className="text-gray-600">
            {isArabic ? 'جاري تحميل قوائمك...' : 'Loading your listings...'}
          </p>
        </div>
      </div>
    );
  }

  const totalItems = products.length + materials.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isArabic ? 'العودة إلى السوق' : 'Back to Marketplace'}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'قوائمي' : 'My Listings'}
            </h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {isArabic ? 'عنصر' : 'items'}
            </p>
          </div>
          <Button onClick={() => navigate('/marketplace/sell')}>
            <Plus className="w-4 h-4 mr-2" />
            {isArabic ? 'إضافة عنصر جديد' : 'Add New Item'}
          </Button>
        </div>

        {totalItems === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold mb-2">
                {isArabic ? 'لا توجد قوائم بعد' : 'No listings yet'}
              </p>
              <p className="text-gray-500 mb-6">
                {isArabic 
                  ? 'ابدأ ببيع منتجاتك أو موادك القابلة لإعادة التدوير' 
                  : 'Start selling your products or recyclable materials'}
              </p>
              <Button onClick={() => navigate('/marketplace/sell')}>
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? 'إنشاء أول قائمة' : 'Create First Listing'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                {isArabic ? 'الكل' : 'All'} ({totalItems})
              </TabsTrigger>
              <TabsTrigger value="products">
                {isArabic ? 'المنتجات' : 'Products'} ({products.length})
              </TabsTrigger>
              <TabsTrigger value="materials">
                {isArabic ? 'المواد' : 'Materials'} ({materials.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((item) => (
                  <ItemCard key={`product-${item.id}`} item={item} type="product" />
                ))}
                {materials.map((item) => (
                  <ItemCard key={`material-${item.id}`} item={item} type="material" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">
                      {isArabic ? 'لا توجد منتجات بعد' : 'No products yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((item) => (
                    <ItemCard key={item.id} item={item} type="product" />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials">
              {materials.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">
                      {isArabic ? 'لا توجد مواد بعد' : 'No materials yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {materials.map((item) => (
                    <ItemCard key={item.id} item={item} type="material" />
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

export default MyListingsPage;
