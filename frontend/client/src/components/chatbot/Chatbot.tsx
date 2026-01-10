import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { MessageCircle, Send, X, Plus, Paperclip, Mic, Keyboard } from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { VoiceChat } from './VoiceChat';
import Logo from '@/components/common/Logo/Logo';
import styles from './Chatbot.module.css';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [connectionError, setConnectionError] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Atomic selectors - tránh re-render không cần thiết
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Function to check current auth status
  const getCurrentAuthStatus = useCallback(() => {
    const token = localStorage.getItem('english_learning_token');
    const userStr = localStorage.getItem('english_learning_user');
    const hasToken = !!token;
    const userData = userStr ? JSON.parse(userStr) : null;

    return {
      isAuth: hasToken && isAuthenticated,
      currentUser: userData || user
    };
  }, [isAuthenticated, user]);

  // Initial welcome message based on auth status
  useEffect(() => {
    // Chỉ set welcome message khi mở chatbot lần đầu hoặc khi đóng rồi mở lại
    if (!isOpen) {
      setHasLoadedHistory(false);
      return;
    }

    // Nếu đã load history rồi thì không set welcome message nữa
    if (hasLoadedHistory) return;

    const { isAuth, currentUser } = getCurrentAuthStatus();

    const welcomeMessage = {
      id: 'welcome',
      text: isAuth
        ? `Xin chào ${currentUser?.fullName || 'bạn'}! Tôi là AI Assistant của EnglishPro. Tôi có thể giúp gì cho bạn?`
        : 'Xin chào! Tôi là AI Assistant. Tôi có thể giúp gì cho bạn hôm nay?',
      isBot: true,
      timestamp: new Date(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, [isOpen, hasLoadedHistory, getCurrentAuthStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent scroll propagation to page
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Prevent scroll propagation when at boundaries
      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isOpen, isMinimized]);

  // Reset and reload when auth state changes
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [isOpen, hasLoadedHistory]);

  const loadChatHistory = async () => {
    try {
      // Only load history for authenticated users
      if (!apiService.isAuthenticated()) {
        setConnectionError(false);
        return;
      }

      setIsLoadingHistory(true);
      setConnectionError(false);

      interface ChatHistoryResponse {
        success: boolean;
        history?: Array<{ sessionId: string }>;
      }

      interface SessionResponse {
        success: boolean;
        session?: {
          id: string;
          messages: Array<{
            _id?: string;
            timestamp: string;
            role: string;
            content: string;
            metadata?: { type?: string };
          }>;
        };
      }

      const response = await apiService.getChatHistory(20, 1) as unknown as ChatHistoryResponse;
      if (response.success && response.history?.length) {
        // Get the latest session
        const latestSession = response.history[0];
        if (latestSession.sessionId) {
          const sessionResponse = await apiService.getChatSession(latestSession.sessionId) as unknown as SessionResponse;
          if (sessionResponse.success && sessionResponse.session?.messages) {
            const formattedMessages = sessionResponse.session.messages.map((msg) => ({
              id: msg._id || `${msg.timestamp}-${msg.role}`,
              text: msg.content,
              isBot: msg.role === 'assistant',
              timestamp: new Date(msg.timestamp),
              type: msg.metadata?.type
            }));
            
            // Thay thế toàn bộ messages bằng history (không append)
            setMessages(formattedMessages);
            setSessionId(sessionResponse.session.id);
            setHasLoadedHistory(true);
          }
        }
      } else {
        // Không có history, đánh dấu đã load để không load lại
        setHasLoadedHistory(true);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Check if it's a connection error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setConnectionError(true);
      }
      // Don't show error to user, just silently handle it
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle voice chat transcript (user spoke)
  const handleVoiceTranscript = (transcript: string) => {
    const userMessage: Message = {
      id: `user-voice-${Date.now()}`,
      text: transcript,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
  };

  // Handle voice chat AI response
  const handleVoiceResponse = (response: string) => {
    const botMessage: Message = {
      id: `bot-voice-${Date.now()}`,
      text: response,
      isBot: true,
      timestamp: new Date(),
      type: 'voice'
    };
    setMessages(prev => [...prev, botMessage]);
  };

  // Build conversation history for voice chat
  const getConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }));
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
      const response = await apiService.sendMessage(inputText, 'general', sessionId);

      if (response.success) {
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: (response as unknown as { response?: string }).response || '',
          isBot: true,
          timestamp: new Date(),
          type: 'response'
        };

        setMessages(prev => [...prev, botMessage]);

        // Cập nhật sessionId từ response (cho lần chat tiếp theo)
        const responseWithSession = response as unknown as { sessionId?: string };
        if (responseWithSession.sessionId) {
          setSessionId(responseWithSession.sessionId);
        }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle quick action selection
  const handleQuickAction = async (action: string) => {
    setShowQuickActions(false);
    
    let messageText = '';
    if (action === 'progress') {
      messageText = 'Phân tích tiến độ học tập của tôi';
    } else if (action === 'roadmap') {
      messageText = 'Đề xuất lộ trình học tập cho tôi';
    }

    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let response;
      
      // Gọi API tương ứng với action
      if (action === 'progress') {
        response = await apiService.generateProgressAnalysis();
      } else if (action === 'roadmap') {
        response = await apiService.generateLearningRecommendations();
      } else {
        throw new Error('Invalid action');
      }

      if (response.success) {
        // Lấy content từ response (analysis hoặc recommendations)
        const apiResponse = response as { success: boolean; analysis?: string; recommendations?: string; sessionId?: string };
        const content = apiResponse.analysis || apiResponse.recommendations || 'Không có dữ liệu';
        
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: content,
          isBot: true,
          timestamp: new Date(),
          type: action === 'progress' ? 'progress_analysis' : 'learning_recommendations'
        };

        setMessages(prev => [...prev, botMessage]);

        // Update sessionId nếu có
        if (apiResponse.sessionId) {
          setSessionId(apiResponse.sessionId);
        }
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Failed to process quick action:', error);

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

  // Get chat window class names
  const getChatWindowClasses = () => {
    let classes = styles.chatWindow;
    if (isExpanded) classes += ` ${styles.chatWindowExpanded}`;
    if (isMinimized) classes += ` ${styles.chatWindowMinimized}`;
    return classes;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={styles.chatButton}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={getChatWindowClasses()}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.logoWrapper}>
                <Logo height={28} color="#ffffff" />
              </div>
              <div className={styles.headerText}>
                <h3>GoPro 4.2</h3>
                <p>The smartest EngPro Model.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
                setIsExpanded(false);
              }}
              className={styles.closeButton}
            >
              <X size={20} />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className={styles.messagesContainer}
              >
                {/* Loading history indicator */}
                {isLoadingHistory && (
                  <div className={styles.loadingIndicator}>
                    Đang tải lịch sử chat...
                  </div>
                )}

                {/* Connection error indicator */}
                {connectionError && messages.length === 0 && (
                  <div className={styles.errorIndicator}>
                    ⚠️ Không thể kết nối đến server.
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageRow} ${message.isBot ? styles.messageRowBot : styles.messageRowUser}`}
                  >
                    <div className={`${styles.messageBubble} ${message.isBot ? styles.messageBubbleBot : styles.messageBubbleUser}`}>
                      <p className={styles.messageContent}>{message.text}</p>
                      <div className={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className={`${styles.messageRow} ${styles.messageRowBot}`}>
                    <div className={styles.typingIndicator}>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={styles.inputArea}>
                {/* Quick Actions Menu */}
                {showQuickActions && !isVoiceMode && (
                  <div className={styles.quickActionsMenu}>
                    <button
                      className={styles.quickActionItem}
                      onClick={() => handleQuickAction('progress')}
                    >
                      <span className={styles.quickActionIcon}>📊</span>
                      <span className={styles.quickActionText}>Phân tích tiến độ học tập</span>
                    </button>
                    <button
                      className={styles.quickActionItem}
                      onClick={() => handleQuickAction('roadmap')}
                    >
                      <span className={styles.quickActionIcon}>🎯</span>
                      <span className={styles.quickActionText}>Đề xuất lộ trình học tập</span>
                    </button>
                  </div>
                )}

                {/* Text Mode Input */}
                {!isVoiceMode && (
                  <div className={styles.inputWrapper}>
                    <button 
                      className={styles.addButton}
                      onClick={() => setShowQuickActions(!showQuickActions)}
                    >
                      <Plus size={20} className={showQuickActions ? styles.plusRotated : ''} />
                    </button>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Chat here.."
                      className={styles.textInput}
                    />
                    <button className={styles.attachButton}>
                      <Paperclip size={18} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className={styles.sendButton}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}

                {/* Voice Mode Component */}
                {isVoiceMode && (
                  <VoiceChat
                    onTranscriptReceived={handleVoiceTranscript}
                    onResponseReceived={handleVoiceResponse}
                    conversationHistory={getConversationHistory()}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

// Memo để tránh re-render không cần thiết
export default memo(Chatbot);