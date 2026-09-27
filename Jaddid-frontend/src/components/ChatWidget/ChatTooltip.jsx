const ChatTooltip = ({ visible, language }) => {
  const isArabic = language === "ar";

  return (
    <div
      className={`pointer-events-none absolute right-[68px] top-1/2 -translate-y-1/2 transition-all duration-200 ${
        visible ? "visible opacity-100 translate-x-0" : "invisible opacity-0 translate-x-2"
      }`}
      aria-hidden={!visible}
    >
      <div
        className={`tooltip-enter relative rounded-full border border-[#B7DEC8] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_24px_rgba(45,106,79,0.15)] ${
          isArabic ? "font-arabic" : ""
        }`}
      >
        <span>{isArabic ? "تحدث مع مساعد جديد" : "Chat with Jaddid AI"}</span>
        <span className="absolute -left-[8px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-r-0 border-y-transparent border-l-white" />
      </div>
    </div>
  );
};

export default ChatTooltip;
