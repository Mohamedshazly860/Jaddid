import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Package, Leaf, Upload, X } from "lucide-react";
import api from "../services/api";
import { toast } from "../hooks/use-toast";

const SellItemPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  // Check if in edit mode
  const isEditMode = searchParams.get("edit") && searchParams.get("id");
  const editType = searchParams.get("edit"); // 'product' or 'material'
  const editId = searchParams.get("id");

  const [itemType, setItemType] = useState(
    editType ||
      (searchParams.get("type") === "material" ? "material" : "product")
  );
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
  });
  const [showNewMaterialForm, setShowNewMaterialForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    name_ar: "",
    category: "",
    description: "",
    description_ar: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: isArabic ? "يجب تسجيل الدخول" : "Login Required",
        description: isArabic
          ? "يرجى تسجيل الدخول لإضافة عناصر للبيع"
          : "Please login to sell items",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate, isArabic]);

  // Fetch materials and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        console.log("Fetching materials and categories...");
        const [materialsRes, categoriesRes] = await Promise.all([
          api.get("/marketplace/materials/"),
          api.get("/marketplace/categories/"),
        ]);
        console.log("Materials response:", materialsRes.data);
        console.log("Categories response:", categoriesRes.data);

        const fetchedMaterials = Array.isArray(materialsRes.data?.results)
          ? materialsRes.data.results
          : Array.isArray(materialsRes.data)
          ? materialsRes.data
          : [];
        let fetchedCategories = Array.isArray(categoriesRes.data?.results)
          ? categoriesRes.data.results
          : Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        // If no categories from backend, create default categories
        if (fetchedCategories.length === 0) {
          console.warn(
            "No categories found in backend. Creating default categories..."
          );

          const defaultCategories = [
            {
              name: "Plastics",
              name_ar: "بلاستيك",
              description: "Plastic materials and products",
              description_ar: "مواد ومنتجات بلاستيكية",
            },
            {
              name: "Paper & Cardboard",
              name_ar: "ورق وكرتون",
              description: "Paper and cardboard materials",
              description_ar: "مواد ورقية وكرتونية",
            },
            {
              name: "Metals",
              name_ar: "معادن",
              description: "Metal materials and products",
              description_ar: "مواد ومنتجات معدنية",
            },
            {
              name: "Glass",
              name_ar: "زجاج",
              description: "Glass materials and products",
              description_ar: "مواد ومنتجات زجاجية",
            },
            {
              name: "Electronics",
              name_ar: "إلكترونيات",
              description: "Electronic materials and products",
              description_ar: "مواد ومنتجات إلكترونية",
            },
          ];

          // Create categories in backend
          const createdCategories = [];
          for (const category of defaultCategories) {
            try {
              console.log(`Creating category: ${category.name}...`);
              const response = await api.post(
                "/marketplace/categories/",
                category
              );
              createdCategories.push(response.data);
              console.log(
                `✓ Created category: ${category.name}`,
                response.data
              );
            } catch (error) {
              console.error(
                `✗ Error creating category ${category.name}:`,
                error.response?.data || error.message
              );
              console.error(`Full error details:`, error.response);
              // Log each field error
              if (error.response?.data) {
                Object.keys(error.response.data).forEach((field) => {
                  console.error(`  ${field}:`, error.response.data[field]);
                });
              }
            }
          }

          if (createdCategories.length > 0) {
            fetchedCategories = createdCategories;
            toast({
              title: isArabic ? "تم إنشاء التصنيفات" : "Categories Created",
              description: isArabic
                ? `تم إنشاء ${createdCategories.length} تصنيف في قاعدة البيانات بنجاح`
                : `Successfully created ${createdCategories.length} categories in the database`,
              variant: "default",
            });
          } else {
            toast({
              title: isArabic
                ? "خطأ في إنشاء التصنيفات"
                : "Error Creating Categories",
              description: isArabic
                ? "فشل إنشاء التصنيفات الافتراضية. يرجى التواصل مع الإدارة."
                : "Failed to create default categories. Please contact admin.",
              variant: "destructive",
            });
          }
        }

        setMaterials(fetchedMaterials);
        setCategories(fetchedCategories);

        // Log final state
        console.log("✓ Final materials count:", fetchedMaterials.length);
        console.log("✓ Final categories count:", fetchedCategories.length);
        console.log("✓ Categories:", fetchedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error details:", error.response?.data);

        setMaterials([]);
        setCategories([]);

        toast({
          title: isArabic ? "خطأ في تحميل البيانات" : "Error Loading Data",
          description: isArabic
            ? "حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى."
            : "Error loading data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isArabic]);

  // Load existing item data if in edit mode
  useEffect(() => {
    const loadItemData = async () => {
      if (!isEditMode) return;

      try {
        setLoadingData(true);
        let response;

        if (editType === "product") {
          response = await api.get(`/marketplace/products/${editId}/`);
          const product = response.data;

          setProductData({
            title: product.title || "",
            title_ar: product.title_ar || "",
            description: product.description || "",
            description_ar: product.description_ar || "",
            price: product.price || "",
            quantity: product.quantity || 1,
            condition: product.condition || "good",
            location: product.location || "",
            latitude: product.latitude || "",
            longitude: product.longitude || "",
            category: product.category || "",
          });

          // Load existing images
          if (product.images && product.images.length > 0) {
            const imageUrls = product.images.map((img) => img.image);
            setPreviewUrls(imageUrls);
          }
        } else if (editType === "material") {
          response = await api.get(`/marketplace/material-listings/${editId}/`);
          const material = response.data;

          setMaterialData({
            material: material.material?.id || "",
            title: material.title || "",
            title_ar: material.title_ar || "",
            description: material.description || "",
            description_ar: material.description_ar || "",
            quantity: material.quantity || "",
            unit: material.unit || "kg",
            price_per_unit: material.price_per_unit || "",
            minimum_order_quantity: material.minimum_order_quantity || "",
            condition: material.condition || "good",
            location: material.location || "",
            latitude: material.latitude || "",
            longitude: material.longitude || "",
            available_from: material.available_from || "",
            available_until: material.available_until || "",
            notes: material.notes || "",
            custom_material_name: "",
          });

          // Load existing image
          if (material.primary_image) {
            setPreviewUrls([material.primary_image]);
          }
        }

        toast({
          title: isArabic ? "تم التحميل" : "Loaded",
          description: isArabic
            ? "تم تحميل بيانات العنصر للتعديل"
            : "Item data loaded for editing",
        });
      } catch (error) {
        console.error("Error loading item data:", error);
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic
            ? "فشل تحميل بيانات العنصر"
            : "Failed to load item data",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadItemData();
  }, [isEditMode, editType, editId, isArabic]);

  // Update tab when URL parameter changes
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "material") {
      setItemType("material");
    } else if (type === "product") {
      setItemType("product");
    }
  }, [searchParams]);

  // Product fields
  const [productData, setProductData] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    price: "",
    quantity: 1,
    condition: "good",
    location: "",
    latitude: "",
    longitude: "",
    category: "",
  });

  // Material fields
  const [materialData, setMaterialData] = useState({
    material: "", // Material ID (from backend Material master data)
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    quantity: "",
    unit: "kg",
    price_per_unit: "",
    minimum_order_quantity: "",
    condition: "good",
    location: "",
    latitude: "",
    longitude: "",
    available_from: "",
    available_until: "",
    notes: "",
    custom_material_name: "", // For when user wants to suggest new material
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "يمكنك تحميل 5 صور كحد أقصى"
          : "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // If user selected "new" category option
      if (showNewCategoryForm && newCategory.name) {
        // Use the first available category as placeholder (backend requires category field)
        if (categories.length > 0) {
          formData.append("category", categories[0].id);
        }

        // Add custom category info in description with special marker
        const customCategoryNote = `
📋 طلب تصنيف جديد / New Category Request
────────────────────────────
اسم التصنيف / Category Name: ${newCategory.name}
${
  newCategory.name_ar
    ? `الاسم بالعربي / Arabic Name: ${newCategory.name_ar}`
    : ""
}
${
  newCategory.description
    ? `الوصف / Description: ${newCategory.description}`
    : ""
}
${
  newCategory.description_ar
    ? `الوصف بالعربي / Arabic Description: ${newCategory.description_ar}`
    : ""
}
────────────────────────────
⚠️ يرجى المراجعة والموافقة من الإدارة
⚠️ Please review and approve by admin

${
  productData.description
    ? "\nوصف المنتج الأصلي / Original Product Description:\n" +
      productData.description
    : ""
}
        `.trim();

        formData.append("description", customCategoryNote);
        console.log("Adding custom category request:", newCategory.name);
      } else {
        // Validate category is selected
        if (!productData.category) {
          toast({
            title: isArabic ? "خطأ" : "Error",
            description: isArabic
              ? "يرجى اختيار تصنيف"
              : "Please select a category",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        formData.append("category", productData.category);

        // Add product data (except category which is already added)
        Object.keys(productData).forEach((key) => {
          if (key !== "category" && productData[key]) {
            formData.append(key, productData[key]);
          }
        });
      }

      // Add remaining product data (except description and category)
      Object.keys(productData).forEach((key) => {
        if (key !== "category" && key !== "description" && productData[key]) {
          formData.append(key, productData[key]);
        }
      });

      // Add images
      images.forEach((image) => {
        formData.append("uploaded_images", image);
      });

      // Set status as draft if custom category, active otherwise
      formData.append(
        "status",
        showNewCategoryForm && newCategory.name ? "draft" : "active"
      );

      // Debug: Log FormData contents
      console.log("=== Product Submission Debug ===");
      console.log("showNewCategoryForm:", showNewCategoryForm);
      console.log("newCategory:", newCategory);
      console.log("productData:", productData);
      console.log("images count:", images.length);
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`
          );
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
      console.log("================================");

      // Use PUT for edit, POST for create
      const response =
        isEditMode && editType === "product"
          ? await api.put(`/marketplace/products/${editId}/`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post("/marketplace/products/", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

      toast({
        title: isArabic ? "تم!" : "Success!",
        description: isEditMode
          ? isArabic
            ? "تم تحديث منتجك بنجاح"
            : "Your product has been updated successfully"
          : showNewCategoryForm && newCategory.name
          ? isArabic
            ? "تم إرسال طلب التصنيف الجديد للمراجعة. سيتم نشر المنتج بعد موافقة الإدارة."
            : "New category request submitted for review. Your product will be published after admin approval."
          : isArabic
          ? "تم نشر منتجك بنجاح"
          : "Your product has been listed successfully",
      });

      navigate(isEditMode ? "/marketplace/my-listings" : "/marketplace");
    } catch (error) {
      console.error("Product creation error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);

      // Log all validation errors
      if (error.response?.data) {
        console.error("=== Backend Validation Errors ===");
        Object.keys(error.response.data).forEach((field) => {
          console.error(`${field}:`, error.response.data[field]);
        });
      }

      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.message ||
          (isArabic ? "فشل نشر المنتج" : "Failed to create product"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("=== Material Submission Debug ===");
      console.log("showNewMaterialForm:", showNewMaterialForm);
      console.log("newMaterial:", newMaterial);
      console.log("materialData:", materialData);
      console.log("images count:", images.length);

      // If user wants to create new material
      if (showNewMaterialForm && newMaterial.name && newMaterial.category) {
        // First, create the material
        try {
          const materialResponse = await api.post("/marketplace/materials/", {
            name: newMaterial.name,
            name_ar: newMaterial.name_ar,
            category: newMaterial.category,
            description: newMaterial.description,
            description_ar: newMaterial.description_ar,
          });

          console.log("Material created:", materialResponse.data);

          // Use the newly created material ID
          const newMaterialId = materialResponse.data.id;

          const formData = new FormData();
          formData.append("material", newMaterialId);

          // Add material listing data
          Object.keys(materialData).forEach((key) => {
            if (
              key !== "material" &&
              key !== "custom_material_name" &&
              materialData[key]
            ) {
              formData.append(key, materialData[key]);
            }
          });

          // Add images
          images.forEach((image) => {
            formData.append("uploaded_images", image);
          });

          formData.append("status", "active");

          const listingResponse = await api.post(
            "/marketplace/material-listings/",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          toast({
            title: isArabic ? "تم!" : "Success!",
            description: isArabic
              ? "تم إضافة المادة الخام والإعلان بنجاح"
              : "Material and listing created successfully",
          });

          navigate("/marketplace");
          return;
        } catch (materialError) {
          console.error("Material creation error:", materialError);
          toast({
            title: isArabic ? "خطأ" : "Error",
            description:
              materialError.response?.data?.message ||
              (isArabic
                ? "فشل إضافة المادة الخام"
                : "Failed to create material"),
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Regular flow: material already selected
      const formData = new FormData();

      // Validate material is selected
      if (!materialData.material) {
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic
            ? "يرجى اختيار مادة خام"
            : "Please select a raw material",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      formData.append("material", materialData.material);
      console.log("Adding material ID:", materialData.material);

      // Add material listing data
      Object.keys(materialData).forEach((key) => {
        if (
          key !== "material" &&
          key !== "custom_material_name" &&
          key !== "notes" &&
          materialData[key]
        ) {
          formData.append(key, materialData[key]);
          console.log(`FormData: ${key} = ${materialData[key]}`);
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append("uploaded_images", image);
        console.log(`Image ${index + 1}:`, image.name, image.size);
      });

      // Set status as active
      formData.append("status", "active");
      console.log("Status: active");

      console.log("Sending to backend...");

      // Use PUT for edit, POST for create
      const response =
        isEditMode && editType === "material"
          ? await api.put(
              `/marketplace/material-listings/${editId}/`,
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            )
          : await api.post("/marketplace/material-listings/", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

      console.log("Response:", response.data);

      toast({
        title: isArabic ? "تم!" : "Success!",
        description: isEditMode
          ? isArabic
            ? "تم تحديث المادة بنجاح"
            : "Your material has been updated successfully"
          : isArabic
          ? "تم نشر المادة بنجاح"
          : "Your material has been listed successfully",
      });

      navigate(isEditMode ? "/marketplace/my-listings" : "/marketplace");
    } catch (error) {
      console.error("Material creation error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description:
          error.response?.data?.message ||
          (isArabic ? "فشل نشر المادة" : "Failed to create material listing"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-forest mb-8 text-center">
          {isEditMode
            ? isArabic
              ? "تعديل العنصر"
              : "Edit Item"
            : isArabic
            ? "بيع عنصر"
            : "Sell an Item"}
        </h1>

        <Tabs value={itemType} onValueChange={setItemType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="product" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {isArabic ? "منتج" : "Product"}
            </TabsTrigger>
            <TabsTrigger value="material" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              {isArabic ? "مادة خام" : "Raw Material"}
            </TabsTrigger>
          </TabsList>

          {/* Product Form */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">
                  {isArabic ? "تفاصيل المنتج" : "Product Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        {isArabic ? "العنوان (English)" : "Title (English)"}
                      </Label>
                      <Input
                        id="title"
                        value={productData.title}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title_ar">
                        {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
                      </Label>
                      <Input
                        id="title_ar"
                        value={productData.title_ar}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            title_ar: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {isArabic ? "الوصف (English)" : "Description (English)"}
                      </Label>
                      <Textarea
                        id="description"
                        value={productData.description}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description_ar">
                        {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
                      </Label>
                      <Textarea
                        id="description_ar"
                        value={productData.description_ar}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Category & Price & Quantity */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {isArabic ? "التصنيف *" : "Category *"}
                      </Label>
                      <Select
                        value={
                          showNewCategoryForm
                            ? "new"
                            : productData.category || ""
                        }
                        onValueChange={(value) => {
                          if (value === "new") {
                            setShowNewCategoryForm(true);
                            setProductData({ ...productData, category: "" });
                          } else {
                            setShowNewCategoryForm(false);
                            setProductData({ ...productData, category: value });
                          }
                        }}
                        required={!showNewCategoryForm}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isArabic ? "اختر تصنيف" : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingData ? (
                            <SelectItem value="loading" disabled>
                              {isArabic ? "جاري التحميل..." : "Loading..."}
                            </SelectItem>
                          ) : Array.isArray(categories) &&
                            categories.length > 0 ? (
                            <>
                              {categories.map((cat) => (
                                <SelectItem
                                  key={cat.id}
                                  value={cat.id.toString()}
                                >
                                  {isArabic && cat.name_ar
                                    ? cat.name_ar
                                    : cat.name}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="new"
                                className="text-orange font-semibold border-t mt-2 pt-2"
                              >
                                +{" "}
                                {isArabic
                                  ? "أضف تصنيف جديد"
                                  : "Add New Category"}
                              </SelectItem>
                            </>
                          ) : (
                            <SelectItem value="disabled" disabled>
                              {isArabic
                                ? "لا توجد تصنيفات متاحة"
                                : "No categories available"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">
                        {isArabic ? "السعر (EGP)" : "Price (EGP)"}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productData.price}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        {isArabic ? "الكمية" : "Quantity"}
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={productData.quantity}
                        onChange={(e) =>
                          setProductData({
                            ...productData,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* New Category Form - Show when "Add New" is selected */}
                  {showNewCategoryForm && (
                    <Card className="bg-orange/5 border-orange/30">
                      <CardHeader>
                        <CardTitle className="text-sm text-forest">
                          {isArabic
                            ? "معلومات التصنيف الجديد"
                            : "New Category Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "اسم التصنيف (English) *"
                                : "Category Name (English) *"}
                            </Label>
                            <Input
                              value={newCategory.name}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., Textiles, Rubber, Organic Waste"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "اسم التصنيف (عربي)"
                                : "Category Name (Arabic)"}
                            </Label>
                            <Input
                              value={newCategory.name_ar}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  name_ar: e.target.value,
                                })
                              }
                              placeholder={
                                isArabic
                                  ? "مثال: منسوجات، مطاط، نفايات عضوية"
                                  : ""
                              }
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "وصف التصنيف (English)"
                                : "Category Description (English)"}
                            </Label>
                            <Textarea
                              value={newCategory.description}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "وصف التصنيف (عربي)"
                                : "Category Description (Arabic)"}
                            </Label>
                            <Textarea
                              value={newCategory.description_ar}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  description_ar: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewCategoryForm(false);
                            setNewCategory({
                              name: "",
                              name_ar: "",
                              description: "",
                              description_ar: "",
                            });
                          }}
                          className="w-full"
                        >
                          {isArabic
                            ? "إلغاء - اختيار تصنيف موجود"
                            : "Cancel - Select Existing Category"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">
                      {isArabic ? "الحالة" : "Condition"}
                    </Label>
                    <Select
                      value={productData.condition}
                      onValueChange={(value) =>
                        setProductData({ ...productData, condition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">
                          {isArabic ? "جديد" : "New"}
                        </SelectItem>
                        <SelectItem value="like_new">
                          {isArabic ? "كالجديد" : "Like New"}
                        </SelectItem>
                        <SelectItem value="good">
                          {isArabic ? "جيد" : "Good"}
                        </SelectItem>
                        <SelectItem value="fair">
                          {isArabic ? "مقبول" : "Fair"}
                        </SelectItem>
                        <SelectItem value="poor">
                          {isArabic ? "ضعيف" : "Poor"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {isArabic ? "الموقع" : "Location"}
                    </Label>
                    <Input
                      id="location"
                      value={productData.location}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          location: e.target.value,
                        })
                      }
                      placeholder={
                        isArabic ? "مثال: القاهرة، مصر" : "e.g., Cairo, Egypt"
                      }
                      required
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>
                      {isArabic ? "الصور (حد أقصى 5)" : "Images (Max 5)"}
                    </Label>
                    <div className="border-2 border-dashed border-sage/30 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-sage mb-4" />
                      <Label
                        htmlFor="images"
                        className="cursor-pointer text-forest hover:text-sage"
                      >
                        {isArabic
                          ? "انقر لتحميل الصور"
                          : "Click to upload images"}
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-orange text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest/90"
                  >
                    {loading
                      ? isArabic
                        ? "جاري النشر..."
                        : "Publishing..."
                      : isEditMode
                      ? isArabic
                        ? "تحديث المنتج"
                        : "Update Product"
                      : isArabic
                      ? "نشر المنتج"
                      : "Publish Product"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Material Form */}
          <TabsContent value="material">
            <Card>
              <CardHeader>
                <CardTitle className="text-forest">
                  {isArabic ? "تفاصيل المادة الخام" : "Raw Material Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMaterialSubmit} className="space-y-6">
                  {/* Material Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="material">
                      {isArabic
                        ? "اختر المادة الخام *"
                        : "Select Raw Material *"}
                    </Label>
                    <Select
                      value={
                        showNewMaterialForm
                          ? "new"
                          : materialData.material || ""
                      }
                      onValueChange={(value) => {
                        if (value === "new") {
                          setShowNewMaterialForm(true);
                          setMaterialData({ ...materialData, material: "" });
                        } else {
                          setShowNewMaterialForm(false);
                          setMaterialData({ ...materialData, material: value });
                        }
                      }}
                      required={!showNewMaterialForm}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isArabic ? "اختر مادة خام" : "Select a raw material"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(materials) && materials.length > 0 ? (
                          <>
                            {materials.map((mat) => (
                              <SelectItem
                                key={mat.id}
                                value={mat.id.toString()}
                              >
                                {isArabic && mat.name_ar
                                  ? mat.name_ar
                                  : mat.name}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="new"
                              className="text-orange font-semibold border-t mt-2 pt-2"
                            >
                              +{" "}
                              {isArabic
                                ? "أضف مادة خام جديدة"
                                : "Add New Raw Material"}
                            </SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem
                              value="new"
                              className="text-orange font-semibold"
                            >
                              +{" "}
                              {isArabic
                                ? "أضف مادة خام جديدة"
                                : "Add New Raw Material"}
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* New Material Form - Show when "Add New" is selected */}
                  {showNewMaterialForm && (
                    <Card className="bg-orange/5 border-orange/30">
                      <CardHeader>
                        <CardTitle className="text-sm text-forest">
                          {isArabic
                            ? "معلومات المادة الخام الجديدة"
                            : "New Raw Material Information"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Category Selection for New Material */}
                        <div className="space-y-2">
                          <Label>{isArabic ? "التصنيف *" : "Category *"}</Label>
                          <Select
                            value={newMaterial.category}
                            onValueChange={(value) =>
                              setNewMaterial({
                                ...newMaterial,
                                category: value,
                              })
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isArabic ? "اختر تصنيف" : "Select category"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(categories) &&
                                categories.map((cat) => (
                                  <SelectItem
                                    key={cat.id}
                                    value={cat.id.toString()}
                                  >
                                    {isArabic && cat.name_ar
                                      ? cat.name_ar
                                      : cat.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "اسم المادة (English) *"
                                : "Material Name (English) *"}
                            </Label>
                            <Input
                              value={newMaterial.name}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., PET Bottles, Cardboard"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "اسم المادة (عربي)"
                                : "Material Name (Arabic)"}
                            </Label>
                            <Input
                              value={newMaterial.name_ar}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  name_ar: e.target.value,
                                })
                              }
                              placeholder={
                                isArabic ? "مثال: زجاجات بلاستيك، كرتون" : ""
                              }
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "وصف المادة (English)"
                                : "Material Description (English)"}
                            </Label>
                            <Textarea
                              value={newMaterial.description}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              {isArabic
                                ? "وصف المادة (عربي)"
                                : "Material Description (Arabic)"}
                            </Label>
                            <Textarea
                              value={newMaterial.description_ar}
                              onChange={(e) =>
                                setNewMaterial({
                                  ...newMaterial,
                                  description_ar: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewMaterialForm(false);
                            setNewMaterial({
                              name: "",
                              name_ar: "",
                              category: "",
                              description: "",
                              description_ar: "",
                            });
                          }}
                          className="w-full"
                        >
                          {isArabic
                            ? "إلغاء - اختيار مادة موجودة"
                            : "Cancel - Select Existing Material"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Title */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_title">
                        {isArabic ? "العنوان (English)" : "Title (English)"}
                      </Label>
                      <Input
                        id="mat_title"
                        value={materialData.title}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_title_ar">
                        {isArabic ? "العنوان (عربي)" : "Title (Arabic)"}
                      </Label>
                      <Input
                        id="mat_title_ar"
                        value={materialData.title_ar}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            title_ar: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_description">
                        {isArabic ? "الوصف (English)" : "Description (English)"}
                      </Label>
                      <Textarea
                        id="mat_description"
                        value={materialData.description}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_description_ar">
                        {isArabic ? "الوصف (عربي)" : "Description (Arabic)"}
                      </Label>
                      <Textarea
                        id="mat_description_ar"
                        value={materialData.description_ar}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            description_ar: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Quantity, Unit, Price */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mat_quantity">
                        {isArabic ? "الكمية" : "Quantity"}
                      </Label>
                      <Input
                        id="mat_quantity"
                        type="number"
                        step="0.01"
                        value={materialData.quantity}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            quantity: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">
                        {isArabic ? "الوحدة" : "Unit"}
                      </Label>
                      <Select
                        value={materialData.unit}
                        onValueChange={(value) =>
                          setMaterialData({ ...materialData, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">KG</SelectItem>
                          <SelectItem value="ton">Ton</SelectItem>
                          <SelectItem value="bag">Bag</SelectItem>
                          <SelectItem value="item">Item</SelectItem>
                          <SelectItem value="cubic_meter">
                            Cubic Meter
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_unit">
                        {isArabic ? "السعر لكل وحدة" : "Price per Unit"}
                      </Label>
                      <Input
                        id="price_per_unit"
                        type="number"
                        step="0.01"
                        value={materialData.price_per_unit}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            price_per_unit: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Min Order & Condition */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_order">
                        {isArabic
                          ? "الحد الأدنى للطلب"
                          : "Minimum Order Quantity"}
                      </Label>
                      <Input
                        id="min_order"
                        type="number"
                        step="0.01"
                        value={materialData.minimum_order_quantity}
                        onChange={(e) =>
                          setMaterialData({
                            ...materialData,
                            minimum_order_quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mat_condition">
                        {isArabic ? "الحالة" : "Condition"}
                      </Label>
                      <Select
                        value={materialData.condition}
                        onValueChange={(value) =>
                          setMaterialData({ ...materialData, condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">
                            {isArabic ? "ممتاز" : "Excellent"}
                          </SelectItem>
                          <SelectItem value="good">
                            {isArabic ? "جيد" : "Good"}
                          </SelectItem>
                          <SelectItem value="acceptable">
                            {isArabic ? "مقبول" : "Acceptable"}
                          </SelectItem>
                          <SelectItem value="poor">
                            {isArabic ? "ضعيف" : "Poor"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="mat_location">
                      {isArabic ? "الموقع" : "Location"}
                    </Label>
                    <Input
                      id="mat_location"
                      value={materialData.location}
                      onChange={(e) =>
                        setMaterialData({
                          ...materialData,
                          location: e.target.value,
                        })
                      }
                      placeholder={
                        isArabic ? "مثال: القاهرة، مصر" : "e.g., Cairo, Egypt"
                      }
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {isArabic ? "ملاحظات إضافية" : "Additional Notes"}
                    </Label>
                    <Textarea
                      id="notes"
                      value={materialData.notes}
                      onChange={(e) =>
                        setMaterialData({
                          ...materialData,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>
                      {isArabic ? "الصور (حد أقصى 5)" : "Images (Max 5)"}
                    </Label>
                    <div className="border-2 border-dashed border-sage/30 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-sage mb-4" />
                      <Label
                        htmlFor="mat_images"
                        className="cursor-pointer text-forest hover:text-sage"
                      >
                        {isArabic
                          ? "انقر لتحميل الصور"
                          : "Click to upload images"}
                      </Label>
                      <Input
                        id="mat_images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-orange text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest hover:bg-forest/90"
                  >
                    {loading
                      ? isArabic
                        ? "جاري النشر..."
                        : "Publishing..."
                      : isEditMode
                      ? isArabic
                        ? "تحديث المادة"
                        : "Update Material"
                      : isArabic
                      ? "نشر المادة"
                      : "Publish Material"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default SellItemPage;
