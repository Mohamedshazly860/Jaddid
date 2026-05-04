import { Package, Leaf, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import MaterialCard from "./MaterialCard";

const SellingSection = ({ activeTab, setActiveTab, products, materials }) => {
  const navigate = useNavigate();

  const handleAdd = () => {
    const type = activeTab === "products" ? "product" : "material";
    navigate(`/marketplace/sell?type=${type}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-2 border-[#708A58]/10">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2D4F2B] mb-6">
          Items for Sale
        </h2>

        <button
          onClick={handleAdd}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors duration-200 shadow-sm ${
            activeTab === "products"
              ? "bg-[#2D4F2B] text-white hover:bg-[#3b6b34]"
              : "bg-[#FFB823] text-white hover:bg-[#ffc84d]"
          }`}
        >
          <Plus className="w-4 h-4" />
          {activeTab === "products" ? "Add Product" : "Add Material"}
        </button>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
        <TabButton
          active={activeTab === "products"}
          onClick={() => setActiveTab("products")}
          icon={<Package className="w-5 h-5" />}
          label="Products"
          count={(products || []).length}
        />
        <TabButton
          active={activeTab === "materials"}
          onClick={() => setActiveTab("materials")}
          icon={<Leaf className="w-5 h-5" />}
          label="Materials"
          count={(materials || []).length}
        />
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "products"
          ? (products || []).map((product, idx) => (
              <ProductCard
                key={product.id ?? product.pk ?? product._id ?? idx}
                item={product}
              />
            ))
          : (materials || []).map((material, idx) => (
              <MaterialCard
                key={material.id ?? material.pk ?? material._id ?? idx}
                item={material}
              />
            ))}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 pb-3 px-2 font-semibold transition-all duration-300 ${
      active
        ? "text-[#2D4F2B] border-b-2 border-[#2D4F2B]"
        : "text-gray-400 hover:text-[#708A58]"
    }`}
  >
    {icon}
    <span>{label}</span>
    <span
      className={`text-sm px-2 py-1 rounded-full ${
        active ? "bg-[#708A58] text-white" : "bg-gray-200 text-gray-600"
      }`}
    >
      {count}
    </span>
  </button>
);

export default SellingSection;
