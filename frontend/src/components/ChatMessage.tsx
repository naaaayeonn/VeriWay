import type { ChatMessage as ChatMessageType } from "../types";
import RouteCard from "./RouteCard";
import "./ChatMessage.css";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  return (
    <div className={`message ${message.type}-message`}>
      <div className="message-avatar" aria-hidden="true">
        {message.type === "bot" ? "🤖" : "👤"}
      </div>
      <div className="message-content">
        <div dangerouslySetInnerHTML={{ __html: message.content }} />
        {message.routeData && <RouteCard route={message.routeData} />}
      </div>
    </div>
  );
}
