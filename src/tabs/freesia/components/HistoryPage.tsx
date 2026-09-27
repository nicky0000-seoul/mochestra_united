import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { findEmotion } from '../emotions';
import './HistoryPage.css';

interface Conversation {
  id: string;
  emotion?: string;
  preview?: string;
  createdAt?: { toDate: () => Date };
  messages?: Array<{ role: string; content: string }>;
}

const formatDate = (createdAt?: { toDate: () => Date }) => {
  if (!createdAt || typeof createdAt.toDate !== 'function') {
    return '날짜 정보 없음';
  }

  const date = createdAt.toDate();
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const HistoryPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations', userId, 'chats');
    const conversationsQuery = query(conversationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const nextConversations: Conversation[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Conversation, 'id'>),
        }));

        setConversations(nextConversations);
        setLoading(false);
      },
      (error) => {
        console.error('히스토리 불러오기 실패:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="page history-container">

      <main className="page-main">

        {loading ? (
          <p className="state-text">히스토리를 불러오는 중...</p>
        ) : conversations.length === 0 ? (
          <div className="empty-container">
            <MessageSquare size={64} />
            <p className="empty-text">저장된 대화가 없어요</p>
            <p className="empty-subtext">채팅에서 대화를 시작해 보세요.</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map((conversation) => {
              const emotion = conversation.emotion || '일반';
              const { emoji, color } = findEmotion(emotion);
              const messageCount = conversation.messages?.length || 0;
              const preview =
                conversation.preview ||
                conversation.messages?.[0]?.content ||
                '대화 미리보기가 없습니다.';

              return (
                <article
                  key={conversation.id}
                  className="conversation-card surface-card"
                  style={{ '--emo': color } as React.CSSProperties}
                >
                  <div className="card-date">{formatDate(conversation.createdAt)}</div>
                  <div className="card-content">
                    <div className="card-header">
                      <span className="card-emoji" aria-label={`${emotion} 이모지`}>
                        {emoji}
                      </span>
                      <span className="card-emotion">{emotion}</span>
                    </div>

                    <p className="card-preview">{preview}</p>

                    <div className="card-meta">
                      <span className="card-message-count">
                        <MessageSquare size={14} />
                        메시지 {messageCount}개
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
