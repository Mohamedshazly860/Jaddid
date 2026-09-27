import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const type = product?.type || "product";
  const itemId = product?.id ?? product?.product_id ?? product?.material_id;
  const title = product?.title || product?.name || "Item";
  const price = product?.price ?? product?.price_per_unit ?? 0;
  const condition = product?.condition || product?.status || "New";
  const location = product?.location || product?.city || product?.seller_location || "Local";
  const unit = product?.unit || "unit";

  const href = type === "material" ? `/materials/${itemId}` : `/products/${itemId}`;

  return (
    <Link
      to={href}
      className="block rounded-[12px] border border-[#B7DEC8] bg-white p-3 transition hover:border-[#2D6A4F] hover:shadow-[0_6px_20px_rgba(45,106,79,0.08)]"
    >
      <div className="line-clamp-2 text-sm font-medium text-slate-700">{title}</div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[#2D6A4F]">
          {type === "material"
            ? `${price} / ${unit}`
            : `${price}`}
        </span>
        <span className="rounded-full bg-[#EAF5EE] px-2 py-0.5 text-[10px] font-medium text-[#2D6A4F]">
          {condition}
        </span>
      </div>

      <div className="mt-2 text-[11px] text-slate-500">{location}</div>
    </Link>
  );
};

export default ProductCard;
