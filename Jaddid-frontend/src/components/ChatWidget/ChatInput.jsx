import { ArrowUp } from "lucide-react";

const ChatInput = ({ language, value, onChange, onSend, isLoading }) => {
  const isArabic = language === "ar";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="border-t border-[#DDEFE4] bg-white p-3" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isArabic ? "اسأل عن المنتجات والسياسات..." : "Ask about products, policies..."}
          dir={isArabic ? "rtl" : "ltr"}
          className="h-11 flex-1 rounded-full border border-[#B7DEC8] bg-[#F9FCFA] px-4 text-sm text-slate-700 outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#B7DEC8]"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={onSend}
          disabled={isLoading || !value.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D6A4F] text-white transition hover:bg-[#245A41] disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label={isArabic ? "إرسال الرسالة" : "Send message"}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
