import React, { useState, useEffect, useRef } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { EMOTIONS } from '../emotions';
import './HomePage.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HomePage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 사용자 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // 새 대화 ID 생성
        setConversationId(generateConversationId());
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 대화 ID 생성
  const generateConversationId = () => {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  };

  // Firestore에 대화 저장
  const saveConversation = async (updatedMessages: Message[], emotion: string) => {
    if (!userId || !conversationId) return;

    try {
      const conversationRef = doc(db, 'conversations', userId, 'chats', conversationId);
      
      await setDoc(conversationRef, {
        messages: updatedMessages,
        emotion: emotion,
        preview: updatedMessages[0]?.content.substring(0, 50) || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log('대화 저장 성공!');
    } catch (error) {
      console.error('대화 저장 실패:', error);
    }
  };

  const sendMessage = async (text: string, emotion?: string) => {
    if (!text.trim() || isLoading) return;

    setShowWelcome(false);
    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // 감정 설정
    const currentEmotion = emotion || selectedEmotion || '일반';
    if (emotion && !selectedEmotion) {
      setSelectedEmotion(emotion);
    }

    try {
      const conversationHistory = updatedMessages; 
      // 채팅 서버 (Railway). 로컬 서버로 시험할 때는 .env 의 VITE_FREESIA_API_URL 로 바꿈
      const API_URL = import.meta.env.VITE_FREESIA_API_URL ?? 'https://freesia-production-5edd.up.railway.app';

      // Claude API 호출
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      
      // Claude API 응답 처리
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content[0].text
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Firestore에 저장
      await saveConversation(finalMessages, currentEmotion);
      
    } catch (error) {
      console.error('Error:', error);
      
      // 에러 메시지 표시
      const errorMessage: Message = {
        role: 'assistant',
        content: '죄송해요, 지금 응답을 드릴 수 없어요. 잠시 후 다시 시도해주세요. 🙏'
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmotionClick = (emotionName: string) => {
    sendMessage(`저는 지금 ${emotionName} 느껴요.`, emotionName);
  };

  const resetConversation = () => {
    setMessages([]);
    setShowWelcome(true);
    setInputText('');
    setSelectedEmotion('');
    // 새 대화 ID 생성
    setConversationId(generateConversationId());
  };

  return (
    <div className="page home-container">

      {/* 메인 콘텐츠 */}
      <main className="page-main home-main">
        {showWelcome ? (
          /* 환영 화면 */
          <div className="welcome-section">
            <div className="welcome-message surface-card">
              <p className="welcome-text">
                안녕하세요, 제 이름은 <span className="highlight">프리지아</span>예요.
                <br />
                만나서 반가워요! 💛
              </p>
            </div>

            <h2 className="question">지금 기분은 어떠세요?</h2>

            {/* 텍스트 입력 */}
            <div className="input-section">
              <input
                type="text"
                placeholder="예) 오늘 회의에서 실수해서 불안해요"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                className="text-input"
              />
            </div>

            {/* 감정 버튼 그리드 */}
            <div className="emotions-grid">
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.name}
                  onClick={() => handleEmotionClick(emotion.name)}
                  className="emotion-button"
                  style={{ '--emo': emotion.color } as React.CSSProperties}
                >
                  <span className="emotion-emoji">{emotion.emoji}</span>
                  <span className="emotion-name">{emotion.name}</span>
                </button>
              ))}
            </div>

            <p className="hint-text">
              💡 원하실 때 언제든지 대화를 시작할 수 있어요
            </p>
          </div>
        ) : (
          /* 채팅 화면 */
          <div className="chat-section">
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-bubble">
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant-message">
                  <div className="message-bubble loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 새로 시작하기 버튼 */}
            <button onClick={resetConversation} className="reset-button">
              <RotateCcw size={16} />
              새로 시작하기
            </button>

            {/* 입력창 */}
            <div className="chat-input-section">
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                className="chat-input"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};  



export default HomePage;
