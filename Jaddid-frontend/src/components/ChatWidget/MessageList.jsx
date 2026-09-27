import { useEffect, useRef } from "react";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";

const MessageList = ({ messages, isLoading, language }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 space-y-3 overflow-y-auto bg-[#F7FBF8] px-3 py-3 pb-16"
    >
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full items-center justify-center px-4 text-center">
          <p className="max-w-[220px] text-sm text-slate-500">
            {language === "ar"
              ? "اسألني عن المنتجات أو المواد أو سياساتنا"
              : "Ask me about products, materials, or our policies"}
          </p>
        </div>
      )}

      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} language={language} />
        ) : (
          <AssistantMessage key={message.id} message={message} language={language} />
        )
      )}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-[16px] rounded-bl-[4px] border border-[#B7DEC8] bg-white px-4 py-3 shadow-sm">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2D6A4F] [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2D6A4F] [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#2D6A4F]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
