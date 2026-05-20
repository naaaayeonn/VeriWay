import { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import CampusMap from "./components/CampusMap";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import Sidebar from "./components/Sidebar";
import { parseUserInput, filterRoutes } from "./utils/parser";
import type { ChatMessage as ChatMessageType, ParsedInput } from "./types";
import "./App.css";

const WELCOME_MESSAGE: ChatMessageType = {
  id: "welcome",
  type: "bot",
  content: `
    <p>안녕하세요! <strong>VeriWay</strong>입니다. 🦽</p>
    <p>배리어프리 이동경로를 안내해 드릴게요.</p>
    <p class="hint">출발지, 목적지, 이동 상태를 자유롭게 말씀해 주세요.</p>
    <p class="example">"학생회관에서 중앙도서관까지 휠체어로 갈 수 있는 길 알려줘"</p>
  `,
  timestamp: new Date(),
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedInput, setParsedInput] = useState<ParsedInput | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    // 사용자 메시지 추가
    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      type: "user",
      content: `<p>${text}</p>`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // AI 분석 시뮬레이션 (1.2초 딜레이)
    setTimeout(() => {
      const parsed = parseUserInput(text);
      setParsedInput(parsed);

      let botMsg: ChatMessageType;

      if (parsed.missing_info.length > 0) {
        // 누락 정보 안내
        const missing = parsed.missing_info.join(", ");
        botMsg = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: `
            <p>입력을 분석했지만, <strong>${missing}</strong> 정보가 부족해요. 😅</p>
            <p>다음과 같이 말씀해 주시면 더 정확한 안내가 가능합니다:</p>
            <p class="example">"학생회관에서 중앙도서관까지 목발로 갈 수 있는 길 알려줘"</p>
          `,
          timestamp: new Date(),
        };
      } else {
        const matchedRoutes = filterRoutes(parsed);

        if (matchedRoutes.length > 0) {
          // 경로 찾음
          botMsg = {
            id: `bot-${Date.now()}`,
            type: "bot",
            content: `<p>경로를 찾았어요! 🎉</p>`,
            routeData: matchedRoutes[0],
            timestamp: new Date(),
          };
        } else {
          // 경로 없음
          botMsg = {
            id: `bot-${Date.now()}`,
            type: "bot",
            content: `
              <p>현재 입력하신 조건에 맞는 등록 경로를 찾지 못했어요. 😢</p>
              <p>출발지와 목적지를 다시 확인해 주세요.</p>
              <p class="hint">현재 데모에서는 <strong>학생회관, 중앙도서관, 순헌관, 명신관</strong> 중심의 경로를 지원합니다.</p>
              <p class="example">예: "학생회관에서 중앙도서관까지 목발로 갈 수 있는 길 알려줘"</p>
            `,
            timestamp: new Date(),
          };
        }
      }

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="app">
      <Header />
      {/* 지도 영역 */}
      <section className="map-section">
        <CampusMap />
      </section>

      <main className="main-layout">
        {/* 채팅 영역 */}
        <section className="chat-section">
          <div className="chat-container">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </section>

        {/* 사이드바 */}
        <Sidebar parsedInput={parsedInput} />
      </main>

      <footer className="footer">
        <p>© 2026 VeriWay - 모두를 위한 이동 경로</p>
      </footer>
    </div>
  );
}
