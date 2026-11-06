// src/components/Chat.jsx
import { useState } from "react";
import { Icon } from "@iconify/react";

function Chat({ type = "chat", onWidgetsReceived }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasMessage = message.trim().length > 0;

  const placeholder =
    type === "chat"
      ? "필요한 상황을 자유롭게 말해주세요."
      : "나 지갑을 잃어버렸는데 어떡하지?";

  const API_URL = import.meta.env.VITE_CHAT_API_URL ?? "";

  const handleButtonClick = async () => {
    if (!hasMessage) {
      console.log("음성 입력 시작");
      return;
    }

    if (!API_URL || isLoading) {
      if (!API_URL) {
        console.warn("VITE_CHAT_API_URL이 설정되지 않았습니다.");
      }

      return;
    }

    const submittedMessage = message.trim();

    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: submittedMessage,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("응답:", data);

      // 응답으로 받은 widgets를 MainPage에 전달
      onWidgetsReceived?.(data.widgets ?? []);
    } catch (error) {
      console.error("전송 에러:", error);

      // 에러가 발생하면 기존 위젯을 없애고 싶을 때
      onWidgetsReceived?.([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div className="flex w-full items-center justify-between rounded-button bg-white p-[18px] shadow-md">
      <textarea
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);

          event.target.style.height = "auto";
          event.target.style.height = `${event.target.scrollHeight}px`;
        }}
        onKeyDown={handleKeyDown}
        placeholder={isLoading ? "필요한 서비스를 찾고 있어요..." : placeholder}
        rows={1}
        disabled={isLoading}
        className="
          min-h-6
          max-h-[120px]
          min-w-0
          flex-1
          resize-none
          overflow-y-auto
          bg-transparent
          p-0
          text-body-2
          leading-6
          outline-none
          placeholder:text-gray
          disabled:cursor-not-allowed
        "
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        aria-label={hasMessage ? "메시지 전송" : "음성 입력"}
        className="flex h-6 w-6 shrink-0 items-center justify-center disabled:opacity-40"
      >
        <Icon
          icon={hasMessage ? "mingcute:send-fill" : "mingcute:mic-fill"}
          className="h-6 w-6 text-gray"
        />
      </button>
    </div>
  );
}

export default Chat;