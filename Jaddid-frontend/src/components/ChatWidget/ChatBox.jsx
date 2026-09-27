import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatBox = ({
  language,
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSend,
  onClose,
}) => {
  const isArabic = language === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="chat-box-enter fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[16px] border border-[#B7DEC8] bg-white shadow-[0_8px_32px_rgba(45,106,79,0.15)] max-[640px]:h-[calc(100vh-120px)] max-[640px]:w-[calc(100vw-24px)]"
    >
      <ChatHeader language={language} onClose={onClose} />
      <MessageList messages={messages} isLoading={isLoading} language={language} />
      <ChatInput
        language={language}
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatBox;
