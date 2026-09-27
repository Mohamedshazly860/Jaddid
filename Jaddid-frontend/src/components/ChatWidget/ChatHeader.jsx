import { Leaf, X } from "lucide-react";

const ChatHeader = ({ language, onClose }) => {
  const isArabic = language === "ar";

  return (
    <div className="flex items-center justify-between rounded-t-[16px] bg-[#2D6A4F] px-4 py-3 text-white" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Leaf className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Jaddid AI</div>
          <div className="text-[11px] text-white/80">
            {isArabic ? "مساعد سوق إعادة التدوير" : "Recycling Marketplace Assistant"}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        aria-label={isArabic ? "إغلاق الدردشة" : "Close chat"}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ChatHeader;
