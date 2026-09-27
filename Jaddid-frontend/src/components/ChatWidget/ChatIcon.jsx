import { MessageCircle, X } from "lucide-react";

const ChatIcon = ({ isOpen, onToggle, onHoverChange }) => (
  <button
    type="button"
    onClick={onToggle}
    onMouseEnter={() => onHoverChange(true)}
    onMouseLeave={() => onHoverChange(false)}
    aria-label={isOpen ? "Close chat" : "Open chat"}
    className="relative flex h-14 w-14 items-center justify-center rounded-full border-0 bg-[#2D6A4F] text-white shadow-[0_12px_24px_rgba(45,106,79,0.25)] transition-all duration-200 hover:scale-105"
  >
    <span className="chat-pulse" aria-hidden="true" />
    <span className="relative z-10 flex items-center justify-center">
      {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </span>
  </button>
);

export default ChatIcon;
