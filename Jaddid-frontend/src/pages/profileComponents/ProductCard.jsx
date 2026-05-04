import { useNavigate } from "react-router-dom";

const pick = (item, keys) => {
  for (const k of keys) if (item?.[k] !== undefined) return item[k];
  return undefined;
};

const ProductCard = ({ item = {} }) => {
  const navigate = useNavigate();

  const id = pick(item, ["id", "pk", "product_id", "_id"]);
  const name = pick(item, ["name", "title"]) || "Untitled";
  const price = pick(item, ["price", "amount", "cost"]) ?? "-";
  const condition = pick(item, ["condition", "state"]) || "Used";

  const rawImage = pick(item, [
    "primary_image",
    "image",
    "image_url",
    "profile_image",
    "profileImage",
  ]);

  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `http://localhost:8000${rawImage}`
    : (item.images && item.images.length ? item.images[0] : null) ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${
        item.email || "product"
      }`;

  return (
    <div
      className="bg-gradient-to-br from-[#FFF1CA] to-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#708A58]/20 hover:border-[#708A58] cursor-pointer group"
      onClick={() =>
        id &&
        navigate(
          `/marketplace/:type/:id`
            .replace(":type", "product")
            .replace(":id", id)
        )
      }
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-[#2D4F2B] text-white text-xs px-3 py-1 rounded-full">
          {condition}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#2D4F2B] mb-2 line-clamp-1">{name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[#708A58]">{price} EGP</span>
          <button
            className="bg-[#2D4F2B] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#708A58] transition"
            onClick={(e) => {
              e.stopPropagation(); // Prevents double-triggering the div's onClick
              if (id)
                navigate(
                  `/marketplace/:type/:id`
                    .replace(":type", "product")
                    .replace(":id", id)
                );
            }}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
