const UserMessage = ({ message, language }) => (
  <div className="flex justify-end" dir={language === "ar" ? "rtl" : "ltr"}>
    <div className="max-w-[75%] rounded-[16px] rounded-br-[4px] bg-[#2D6A4F] px-3 py-2 text-sm text-white shadow-sm">
      {message.content}
    </div>
  </div>
);

export default UserMessage;
