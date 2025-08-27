import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, TrendingUp, Award, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  const isAuthenticated = apiService.isAuthenticated();

  // Initial welcome message based on auth status
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      text: isAuthenticated 
        ? 'Xin chào! Tôi là AI Assistant của EnglishPro. Vì bạn đã đăng nhập, tôi có thể phân tích dữ liệu học tập thực tế của bạn, đưa ra phản hồi dựa trên kết quả bài thi và gợi ý lộ trình cá nhân hóa. Bạn muốn bắt đầu với gì?'
        : 'Xin chào! Tôi là AI Assistant của EnglishPro. Hiện tại bạn đang ở chế độ khách - tôi có thể trả lời câu hỏi chung và đưa ra gợi ý cơ bản. Để nhận phân tích cá nhân dựa trên dữ liệu học tập thực tế, hãy đăng nhập và hoàn thành ít nhất 1 bài test nhé! 🚀',
      isBot: true,
      timestamp: new Date(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(20, 1);
      if (response.success && response.history?.length > 0) {
        // Get the latest session
        const latestSession = response.history[0];
        if (latestSession.sessionId) {
          const sessionResponse = await apiService.getChatSession(latestSession.sessionId);
          if (sessionResponse.success && sessionResponse.session?.messages) {
            const formattedMessages = sessionResponse.session.messages.map((msg: any) => ({
              id: msg._id || `${msg.timestamp}-${msg.role}`,
              text: msg.content,
              isBot: msg.role === 'assistant',
              timestamp: new Date(msg.timestamp),
              type: msg.metadata?.type
            }));
            setMessages(prev => [...prev, ...formattedMessages]);
            setSessionId(sessionResponse.session.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await apiService.sendMessage(inputText, 'general');
      
      if (response.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: response.response,
          isBot: true,
          timestamp: new Date(),
          type: 'response'
        };

        setMessages(prev => [...prev, botMessage]);
        setSessionId(response.sessionId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        isBot: true,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsTyping(true);
    
    try {
      let response;
      let actionMessage = '';

      switch (action) {
        case 'progress':
          response = await apiService.generateProgressAnalysis();
          actionMessage = 'Phân tích tiến độ học tập của tôi';
          break;
        case 'recommendations':
          response = await apiService.generateLearningRecommendations();
          actionMessage = 'Gợi ý lộ trình học tập cho tôi';
          break;
        default:
          return;
      }

      // Add user action message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: actionMessage,
        isBot: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      if (response.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: response.analysis || response.recommendations,
          isBot: true,
          timestamp: new Date(),
          type: action
        };

        setMessages(prev => [...prev, botMessage]);
        setSessionId(response.sessionId);
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Xin lỗi, tôi không thể thực hiện yêu cầu này lúc này. Vui lòng thử lại sau.',
        isBot: true,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-96'
        } w-80 sm:w-96 flex flex-col`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-lime-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-green-100">Trực tuyến</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isAuthenticated 
                      ? 'bg-yellow-500/20 text-yellow-100' 
                      : 'bg-blue-500/20 text-blue-100'
                  }`}>
                    {isAuthenticated ? '🔒 Dữ liệu thật' : '👤 Chế độ khách'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-green-200 transition-colors duration-200"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-green-200 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAction('progress')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    disabled={isTyping}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Phân tích tiến độ
                  </button>
                  <button
                    onClick={() => handleQuickAction('recommendations')}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors"
                    disabled={isTyping}
                  >
                    <BookOpen className="h-4 w-4" />
                    Gợi ý học tập
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.isBot ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`p-2 rounded-full ${message.isBot ? 'bg-green-100' : 'bg-lime-100'}`}>
                      {message.isBot ? (
                        <Bot className="h-4 w-4 text-green-700" />
                      ) : (
                        <User className="h-4 w-4 text-lime-700" />
                      )}
                    </div>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      message.isBot 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-gradient-to-r from-green-600 to-lime-600 text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-green-100'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-xl transition-colors duration-200"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;