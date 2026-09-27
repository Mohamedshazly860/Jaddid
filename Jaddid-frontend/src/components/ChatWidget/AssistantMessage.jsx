import ProductCard from "./ProductCard";

const AssistantMessage = ({ message, language }) => (
  <div className="flex justify-start" dir={language === "ar" ? "rtl" : "ltr"}>
    <div className="max-w-[85%] rounded-[16px] rounded-bl-[4px] border border-[#B7DEC8] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
      <div className="whitespace-pre-wrap break-words">{message.content}</div>

      {Array.isArray(message.products) && message.products.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {message.products.map((product) => (
            <ProductCard key={product.id ?? `${product.title}-${product.type}`} product={product} />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default AssistantMessage;
