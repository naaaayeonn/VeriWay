import { useState } from "react";
import "./ChatInput.css";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

const QUICK_OPTIONS = [
  {
    label: "🦽 학생회관 → 중앙도서관 (휠체어)",
    value: "학생회관에서 중앙도서관까지 휠체어로 이동하고 싶어",
  },
  {
    label: "🩼 명신관 → 중앙도서관 (목발)",
    value: "명신관에서 중앙도서관까지 목발로 갈 수 있는 길",
  },
  {
    label: "👶 학생회관 → 순헌관 (유모차)",
    value: "학생회관에서 순헌관까지 유모차로 이동 가능한 경로",
  },
];

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-area">
      {/* 빠른 선택 */}
      <div className="quick-options">
        {QUICK_OPTIONS.map((opt, i) => (
          <button
            key={i}
            className="quick-btn"
            onClick={() => onSend(opt.value)}
            disabled={disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 입력 필드 */}
      <div className="input-wrapper">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="이동 경로를 자유롭게 입력하세요..."
          disabled={disabled}
          aria-label="이동 경로 입력"
        />
        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          aria-label="전송"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
