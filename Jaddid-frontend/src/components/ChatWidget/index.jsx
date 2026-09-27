import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/services/api";
import ChatIcon from "./ChatIcon";
import ChatTooltip from "./ChatTooltip";
import ChatBox from "./ChatBox";
import "./chatWidget.css";

const createMessage = (role, content, products = []) => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  products,
  timestamp: new Date(),
});

const getAssistantReply = (payload) => {
  if (typeof payload?.response === "string" && payload.response.trim()) {
    return payload.response;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload?.reply === "string" && payload.reply.trim()) {
    return payload.reply;
  }

  return "I’m here to help with products, recycling guidance, and marketplace questions.";
};

const ChatWidget = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      return;
    }

    setShowTooltip(true);
    const timer = window.setTimeout(() => setShowTooltip(false), 4000);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  const tooltipVisible = showTooltip || isHoveringIcon;

  const handleSendMessage = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) {
      return;
    }

    const userMessage = createMessage("user", trimmedValue);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai-assistant/chat/", {
        message: trimmedValue,
      });

      const assistantMessage = createMessage(
        "assistant",
        getAssistantReply(response?.data),
        Array.isArray(response?.data?.products) ? response.data.products : []
      );

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorText =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        (language === "ar"
          ? "أواجه بعض الصعوبة في الوصول إلى المساعد الآن. حاول مرة أخرى بعد قليل."
          : "I’m having trouble reaching the assistant right now. Please try again in a moment.");

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", errorText, []),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ChatTooltip visible={tooltipVisible} language={language} />
      <div className="relative">
        <ChatIcon
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
          onHoverChange={setIsHoveringIcon}
        />
        {isOpen && (
          <ChatBox
            language={language}
            messages={messages}
            isLoading={isLoading}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSendMessage}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
