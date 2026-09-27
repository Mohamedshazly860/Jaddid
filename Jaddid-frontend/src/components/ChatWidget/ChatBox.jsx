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
      className="chat-box-enter absolute bottom-[calc(100%+12px)] right-0 z-50 flex h-[620px] w-[430px] flex-col overflow-hidden rounded-[18px] border border-[#B7DEC8] bg-white shadow-[0_12px_36px_rgba(45,106,79,0.18)]
        max-[640px]:bottom-[calc(100%+8px)] max-[640px]:h-[calc(100vh-92px)] max-[640px]:w-[calc(100vw-24px)]"
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
