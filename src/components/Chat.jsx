import { useState } from "react";
import { Icon } from "@iconify/react";

function Chat({ onSend, isLoading, clarification }) {
  const [message, setMessage] = useState("");
  const hasMessage = message.trim().length > 0;

  async function send() {
    if (!hasMessage || isLoading) return;
    if (await onSend(message.trim())) setMessage("");
  }

  return (
    <form
      className="flex w-full items-center justify-between rounded-button bg-white p-[18px] shadow-md"
      onSubmit={(event) => { event.preventDefault(); void send(); }}
    >
      <textarea
        aria-label="메시지"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void send();
          }
        }}
        placeholder={isLoading ? "필요한 서비스를 찾고 있어요..." : clarification ? "빠진 정보만 답해 주세요." : "필요한 상황을 자유롭게 말해주세요."}
        rows={1}
        maxLength={2000}
        disabled={isLoading}
        className="min-h-6 max-h-[120px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent p-0 text-body-2 leading-6 outline-none placeholder:text-gray disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={isLoading || !hasMessage}
        aria-label="메시지 전송"
        className="flex h-6 w-6 shrink-0 items-center justify-center disabled:opacity-40"
      >
        <Icon icon="mingcute:send-fill" className="h-6 w-6 text-gray" />
      </button>
    </form>
  );
}

export default Chat;
