// src/pages/OrdersPage.jsx - Updated with proper purchase/sales filtering
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ordersService from "@/services/ordersService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const OrdersPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [purchasesNext, setPurchasesNext] = useState(null);
  const [purchasesPrev, setPurchasesPrev] = useState(null);
  const [purchasesCount, setPurchasesCount] = useState(0);
  const PAGE_SIZE = 10;
  const [purchasesJump, setPurchasesJump] = useState("");
  const [sales, setSales] = useState([]);
  const [salesPage, setSalesPage] = useState(1);
  const [salesNext, setSalesNext] = useState(null);
  const [salesPrev, setSalesPrev] = useState(null);
  const [salesCount, setSalesCount] = useState(0);
  const [salesJump, setSalesJump] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchases");
  const { toast } = useToast();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);
  const fetchOrders = async () => {
    await Promise.all([fetchPurchases(purchasesPage), fetchSales(salesPage)]);
  };

  const fetchPurchases = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ordersService.getPurchases(page);
      const data = res.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setPurchases(results);
      setPurchasesNext(data.next || null);
      setPurchasesPrev(data.previous || null);
      setPurchasesCount(data.count || results.length);
    } catch (error) {
      console.error("Failed fetching purchases:", error.response?.data || error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل تحميل المشتريات" : "Failed to load purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async (page = 1) => {
    try {
      setLoading(true);
      const res = await ordersService.getSales(page);
      const data = res.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setSales(results);
      setSalesNext(data.next || null);
      setSalesPrev(data.previous || null);
      setSalesCount(data.count || results.length);
    } catch (error) {
      console.error("Failed fetching sales:", error.response?.data || error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic ? "فشل تحميل المبيعات" : "Failed to load sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPurchasesPage = (page) => {
    const total = Math.max(1, Math.ceil((purchasesCount || 0) / PAGE_SIZE));
    const p = Math.max(1, Math.min(page || 1, total));
    setPurchasesPage(p);
    fetchPurchases(p);
  };

  const goToSalesPage = (page) => {
    const total = Math.max(1, Math.ceil((salesCount || 0) / PAGE_SIZE));
    const p = Math.max(1, Math.min(page || 1, total));
    setSalesPage(p);
    fetchSales(p);
  };

  const OrderCard = ({ order, isSale = false }) => {
    const firstItem = order.items?.[0];
    const displayName = firstItem
      ? firstItem.product_title ||
        firstItem.material_name ||
        (isArabic ? "عنصر غير معروف" : "Unknown Item")
      : isArabic
      ? "لا توجد عناصر"
      : "No items";

    const shortId = order.order_id?.slice(0, 8).toUpperCase() || "N/A";
    const price = parseFloat(order.total_price || 0).toFixed(2);
    const orderDate = new Date(order.created_at).toLocaleDateString(
      isArabic ? "ar-EG" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );

    const getStatusDisplay = (status) => {
      const statusMap = {
        pending: {
          text: isArabic ? "قيد الانتظار" : "Pending",
          color: "bg-yellow-100 text-yellow-700",
        },
        confirmed: {
          text: isArabic ? "تم التأكيد" : "Confirmed",
          color: "bg-blue-100 text-blue-700",
        },
        in_progress: {
          text: isArabic ? "جاري التنفيذ" : "In Progress",
          color: "bg-blue-100 text-blue-700",
        },
        courier_assigned: {
          text: isArabic ? "تم تعيين السائق" : "Courier Assigned",
          color: "bg-purple-100 text-purple-700",
        },
        on_the_way: {
          text: isArabic ? "في الطريق" : "On the Way",
          color: "bg-indigo-100 text-indigo-700",
        },
        delivered: {
          text: isArabic ? "تم التوصيل" : "Delivered",
          color: "bg-green-100 text-green-700",
        },
        completed: {
          text: isArabic ? "مكتمل" : "Completed",
          color: "bg-green-100 text-green-700",
        },
        cancelled: {
          text: isArabic ? "ملغي" : "Cancelled",
          color: "bg-red-100 text-red-700",
        },
      };

      return (
        statusMap[status] || {
          text: status,
          color: "bg-gray-100 text-gray-700",
        }
      );
    };

    const statusInfo = getStatusDisplay(order.order_status);

    return (
      <div className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-2 mb-3">
          <div>
            <h3 className="font-bold text-lg">
              {isArabic ? "طلب" : "Order"} #{shortId}
            </h3>
            <p className="text-xs text-gray-500">{orderDate}</p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </div>

        {/* Item Info */}
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
            <Package className="text-gray-400" size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 truncate">
              {displayName}
            </h4>
            <p className="text-sm text-gray-600">
              {isArabic ? "الكمية:" : "Quantity:"} {firstItem?.quantity || 0}
            </p>
            <p className="text-green-600 font-bold mt-1">${price}</p>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 pt-3 border-t text-sm text-gray-600 space-y-1">
          <p className="truncate">
            <strong>
              {isSale
                ? isArabic
                  ? "المشتري:"
                  : "Buyer:"
                : isArabic
                ? "البائع:"
                : "Seller:"}
            </strong>{" "}
            {isSale ? order.buyer_email : order.seller_email}
          </p>
          <p className="truncate">
            <strong>{isArabic ? "العنوان:" : "Delivery:"}</strong>{" "}
            {order.delivery_address ||
              (isArabic ? "غير محدد" : "Not specified")}
          </p>
          {order.payment_status && (
            <p>
              <strong>{isArabic ? "الدفع:" : "Payment:"}</strong>{" "}
              <span
                className={
                  order.payment_status === "paid"
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {order.payment_status === "paid"
                  ? isArabic
                    ? "مدفوع"
                    : "Paid"
                  : isArabic
                  ? "قيد الانتظار"
                  : "Pending"}
              </span>
            </p>
          )}
        </div>

        {/* Track Button */}
        <Button
          onClick={() => navigate(`/order-tracking/${order.order_id}`)}
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          {isArabic ? "عرض التفاصيل والتتبع" : "View Details & Track"}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-green-500" />
          <p className="text-gray-600">
            {isArabic ? "جاري تحميل الطلبات..." : "Loading orders..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold mb-8">
          {isArabic ? "طلباتي" : "My Orders"}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="purchases">
              {isArabic ? "المشتريات" : "Purchases"} ({purchasesCount})
            </TabsTrigger>
            <TabsTrigger value="sales">
              {isArabic ? "المبيعات" : "Sales"} ({salesCount})
            </TabsTrigger>
          </TabsList>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="mt-6">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">
                    {isArabic ? "لا توجد مشتريات بعد" : "No purchases yet"}
                  </p>
                  <p className="text-gray-500 mb-6">
                    {isArabic
                      ? "سيظهر سجل مشترياتك هنا"
                      : "Your purchase history will appear here"}
                  </p>
                  <Button onClick={() => navigate("/marketplace")}>
                    {isArabic ? "تصفح السوق" : "Browse Marketplace"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((order) => (
                  <OrderCard
                    key={order.order_id || order.id}
                    order={order}
                    isSale={false}
                  />
                ))}
              </div>
            )}
            {purchasesCount > 0 && (
              <div className="flex flex-col items-center mt-6 gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => goToPurchasesPage(1)}
                    disabled={purchasesPage === 1}
                  >
                    {isArabic ? "الأولى" : "First"}
                  </Button>

                  <Button
                    onClick={() => goToPurchasesPage(purchasesPage - 1)}
                    disabled={!purchasesPrev}
                  >
                    {isArabic ? "السابق" : "Previous"}
                  </Button>

                  <div className="flex items-center gap-2 px-3">
                    <div className="text-sm text-gray-600">
                      {isArabic ? "صفحة" : "Page"}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, Math.ceil((purchasesCount || 0) / PAGE_SIZE))}
                      value={purchasesJump || purchasesPage}
                      onChange={(e) => setPurchasesJump(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = Number(purchasesJump || purchasesPage);
                          goToPurchasesPage(val);
                          setPurchasesJump("");
                        }
                      }}
                      className="w-20 p-1 border rounded text-center"
                    />
                    <div className="text-sm text-gray-600">/ {Math.max(1, Math.ceil((purchasesCount || 0) / PAGE_SIZE))}</div>
                    <Button
                      onClick={() => {
                        const val = Number(purchasesJump || purchasesPage);
                        goToPurchasesPage(val);
                        setPurchasesJump("");
                      }}
                    >
                      Go
                    </Button>
                  </div>

                  <Button
                    onClick={() => goToPurchasesPage(purchasesPage + 1)}
                    disabled={!purchasesNext}
                  >
                    {isArabic ? "التالي" : "Next"}
                  </Button>

                  <Button
                    onClick={() => goToPurchasesPage(Math.max(1, Math.ceil((purchasesCount || 0) / PAGE_SIZE)))}
                    disabled={purchasesPage === Math.max(1, Math.ceil((purchasesCount || 0) / PAGE_SIZE))}
                  >
                    {isArabic ? "الأخيرة" : "Last"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-6">
            {sales.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold mb-2">
                    {isArabic ? "لا توجد مبيعات بعد" : "No sales yet"}
                  </p>
                  <p className="text-gray-500 mb-6">
                    {isArabic
                      ? "سيظهر سجل مبيعاتك هنا"
                      : "Your sales history will appear here"}
                  </p>
                  <Button onClick={() => navigate("/marketplace")}>
                    {isArabic ? "إضافة منتج للبيع" : "Add Product to Sell"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sales.map((order) => (
                  <OrderCard
                    key={order.order_id || order.id}
                    order={order}
                    isSale={true}
                  />
                ))}
              </div>
            )}
            {salesCount > 0 && (
              <div className="flex flex-col items-center mt-6 gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => goToSalesPage(1)}
                    disabled={salesPage === 1}
                  >
                    {isArabic ? "الأولى" : "First"}
                  </Button>

                  <Button
                    onClick={() => goToSalesPage(salesPage - 1)}
                    disabled={!salesPrev}
                  >
                    {isArabic ? "السابق" : "Previous"}
                  </Button>

                  <div className="flex items-center gap-2 px-3">
                    <div className="text-sm text-gray-600">
                      {isArabic ? "صفحة" : "Page"}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, Math.ceil((salesCount || 0) / PAGE_SIZE))}
                      value={salesJump || salesPage}
                      onChange={(e) => setSalesJump(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = Number(salesJump || salesPage);
                          goToSalesPage(val);
                          setSalesJump("");
                        }
                      }}
                      className="w-20 p-1 border rounded text-center"
                    />
                    <div className="text-sm text-gray-600">/ {Math.max(1, Math.ceil((salesCount || 0) / PAGE_SIZE))}</div>
                    <Button
                      onClick={() => {
                        const val = Number(salesJump || salesPage);
                        goToSalesPage(val);
                        setSalesJump("");
                      }}
                    >
                      Go
                    </Button>
                  </div>

                  <Button
                    onClick={() => goToSalesPage(salesPage + 1)}
                    disabled={!salesNext}
                  >
                    {isArabic ? "التالي" : "Next"}
                  </Button>

                  <Button
                    onClick={() => goToSalesPage(Math.max(1, Math.ceil((salesCount || 0) / PAGE_SIZE)))}
                    disabled={salesPage === Math.max(1, Math.ceil((salesCount || 0) / PAGE_SIZE))}
                  >
                    {isArabic ? "الأخيرة" : "Last"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};
export default OrdersPage;