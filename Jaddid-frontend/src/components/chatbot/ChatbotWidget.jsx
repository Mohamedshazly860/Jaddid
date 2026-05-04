import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../../services/chatbotService';

// Format text with markdown-style formatting
const formatMessage = (text) => {
  if (!text) return '';
  
  // Split text into lines for processing
  const lines = text.split('\n');
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      formattedLines.push(<br key={`br-${i}`} />);
      continue;
    }
    
    // Headers (lines ending with : or lines in ALL CAPS)
    if (line.match(/^[A-Z][^a-z]*:$/) || line.match(/^#{1,3}\s/)) {
      const headerText = line.replace(/^#{1,3}\s/, '').replace(/:$/, '');
      formattedLines.push(
        <div key={i} className="font-bold text-base mb-2 mt-3 text-gray-900">
          {headerText}
        </div>
      );
      continue;
    }
    
    // Bullet points
    if (line.match(/^[•\-\*]\s/) || line.match(/^\d+\.\s/)) {
      const bulletText = line.replace(/^[•\-\*]\s/, '').replace(/^\d+\.\s/, '');
      const formatted = formatInlineText(bulletText);
      formattedLines.push(
        <div key={i} className="flex gap-2 mb-1 ml-2">
          <span className="text-sage font-bold">•</span>
          <span className="flex-1">{formatted}</span>
        </div>
      );
      continue;
    }
    
    // Bold text patterns
    if (line.includes('**') || line.match(/^[A-Z][^:]*:/)) {
      const formatted = formatInlineText(line);
      formattedLines.push(
        <div key={i} className="mb-2">
          {formatted}
        </div>
      );
      continue;
    }
    
    // Regular text
    const formatted = formatInlineText(line);
    formattedLines.push(
      <div key={i} className="mb-2">
        {formatted}
      </div>
    );
  }
  
  return <div className="space-y-1">{formattedLines}</div>;
};

// Format inline text elements (bold, italic, code, links)
const formatInlineText = (text) => {
  const parts = [];
  let currentIndex = 0;
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|https?:\/\/[^\s]+)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    
    const matchedText = match[0];
    
    // Bold text **text**
    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-gray-900">
          {matchedText.slice(2, -2)}
        </strong>
      );
    }
    // Italic text *text*
    else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic">
          {matchedText.slice(1, -1)}
        </em>
      );
    }
    // Code `text`
    else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      parts.push(
        <code key={match.index} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
          {matchedText.slice(1, -1)}
        </code>
      );
    }
    // Links
    else if (matchedText.startsWith('http')) {
      parts.push(
        <a
          key={match.index}
          href={matchedText}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sage hover:text-forest underline"
        >
          {matchedText}
        </a>
      );
    }
    
    currentIndex = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "👋 Hi! I'm Jaddid Assistant. I can help you find recyclable materials, eco-friendly products, and answer questions about our marketplace. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(inputMessage);
      
      const botMessage = {
        type: 'bot',
        content: response.bot_reply,
        timestamp: new Date(),
        intent: response.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What materials can I sell?",
    "Show me plastic listings under 500 EGP",
    "Tell me about material pricing",
    "How does the platform work?",
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-sage hover:bg-forest text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            ?
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-sage to-forest text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Jaddid Assistant</h3>
                <p className="text-xs text-white/80">AI-powered helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-sage text-white rounded-br-sm'
                      : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <div className="text-sm break-words">
                    {message.type === 'bot' 
                      ? formatMessage(message.content)
                      : <p className="whitespace-pre-wrap">{message.content}</p>
                    }
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === 'user'
                        ? 'text-white/70'
                        : message.isError
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Questions */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Quick questions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left text-sm bg-white border border-gray-200 hover:border-sage hover:bg-green-pale rounded-lg px-3 py-2 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-sage hover:bg-forest disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by AI • Always learning
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
