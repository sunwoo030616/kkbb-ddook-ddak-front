import { useEffect, useRef, useState } from "react";
import Chat from "../components/Chat.jsx";
import WidgetRenderer from "../components/WidgetRenderer.jsx";
import ClarificationWidget from "../components/widgets/ClarificationWidget.jsx";
import { createCanvas, recordFeedback, sessionStorageKey } from "../lib/canvasApi.js";

const EMPTY_CANVAS = { greeting: "", widgets: [] };
const SESSION_TTL_MS = 30 * 60 * 1000;
const STARTER_MESSAGES = ["여행 환전이랑 보험 알려줘", "분실 카드 정지해줘"];

function readSession() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(sessionStorageKey));
    if (stored?.id && Array.isArray(stored.canvas?.widgets)
        && Date.now() - stored.updatedAt < SESSION_TTL_MS) return stored;
  } catch {
    // 저장소 사용이 제한된 브라우저에서도 열린 화면에서 대화를 이어간다.
  }
  return { id: null, canvas: EMPTY_CANVAS, updatedAt: 0 };
}

function storeSession({ id, canvas, updatedAt }) {
  try {
    if (id) sessionStorage.setItem(sessionStorageKey, JSON.stringify({ id, canvas, updatedAt }));
    else sessionStorage.removeItem(sessionStorageKey);
  } catch {
    // 화면 상태는 메모리에 남는다.
  }
}

function ChatPage() {
  const [initialSession] = useState(readSession);
  const [canvas, setCanvas] = useState(initialSession.canvas);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState("");
  const [chatVersion, setChatVersion] = useState(0);
  const sessionId = useRef(initialSession.id);
  const sessionUpdatedAt = useRef(initialSession.updatedAt);
  const sending = useRef(false);
  const feedbackSent = useRef(new WeakMap());

  useEffect(() => {
    storeSession({ id: sessionId.current, canvas, updatedAt: sessionUpdatedAt.current });
  }, [canvas]);

  async function send(message) {
    if (sending.current) return false;
    sending.current = true;
    setIsLoading(true);
    setError("");
    try {
      const previousSessionId = sessionId.current;
      const { data, receivedAt } = await createCanvas(message, previousSessionId);
      sessionId.current = data.sessionId || null;
      sessionUpdatedAt.current = receivedAt;
      const widgets = (data.widgets ?? []).map((widget) => ({ widget, requestId: data.requestId }));
      setCanvas((previous) => {
        const continuation = data.resumedFromSession && data.sessionId && data.sessionId === previousSessionId;
        const updatedTypes = new Set(widgets.map(({ widget }) => widget.type));
        const retained = continuation
          ? previous.widgets.filter(({ widget }) => widget.type !== "clarification_widget" && !updatedTypes.has(widget.type))
          : [];
        return { greeting: data.greeting || "", widgets: [...retained, ...widgets], demo: data.demo === true };
      });
      return true;
    } catch (error) {
      setError(error instanceof TypeError ? "서버에 연결하지 못했어요. 다시 시도해 주세요." : error.message);
      return false;
    } finally {
      sending.current = false;
      setIsLoading(false);
    }
  }

  function reset() {
    if (sending.current) return;
    sessionId.current = null;
    sessionUpdatedAt.current = 0;
    storeSession({ id: null });
    setCanvas(EMPTY_CANVAS);
    setError("");
    setChatVersion((value) => value + 1);
  }

  function sendFeedback(entry, event) {
    if (!entry.requestId) return;
    const sent = feedbackSent.current.get(entry) || new Set();
    if (sent.has(event)) return;
    sent.add(event);
    feedbackSent.current.set(entry, sent);
    recordFeedback(entry.requestId, entry.widget.type, event);
  }

  function dismiss(entry) {
    sendFeedback(entry, "DISMISSED");
    setCanvas((previous) => ({ ...previous, widgets: previous.widgets.filter((widget) => widget !== entry) }));
  }

  const hasClarification = canvas.widgets.some(({ widget }) => widget.type === "clarification_widget");
  const greeting = hasClarification
    ? (canvas.widgets.length > 1 ? "준비된 기능부터 보여드릴게요." : "아래 질문에 답해 주세요.")
    : canvas.greeting || "어떤 금융 기능이 필요하세요?";

  return (
    <section className="flex flex-col gap-3 px-[10px] pb-[110px]">
      <section className="flex flex-col gap-3" aria-label="깨비뚝딱 대화">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-2 text-darkgray" role="status">{greeting}</p>
          <button
            type="button"
            disabled={isLoading}
            onClick={reset}
            className="shrink-0 rounded-full bg-white px-3 py-2 text-caption-1 text-darkgray disabled:opacity-50"
          >
            새 대화
          </button>
        </div>
        {canvas.demo && <p className="text-caption-1 text-darkgray">시연 모드 · 예시 데이터로 동작합니다.</p>}
        {!canvas.greeting && (
          <div className="flex flex-wrap gap-2">
            {STARTER_MESSAGES.map((message) => (
              <button key={message} type="button" disabled={isLoading} onClick={() => send(message)}
                className="rounded-full bg-white px-3 py-2 text-caption-1 text-darkgray disabled:opacity-50">
                {message}
              </button>
            ))}
          </div>
        )}
        {error && <p role="alert" className="rounded-button bg-white p-3 text-body-2 text-darkgray">{error}</p>}
        {canvas.widgets.map((entry) => {
          const { widget, requestId } = entry;
          if (widget.type === "clarification_widget") {
            return <ClarificationWidget key={`${requestId}-clarification`} {...widget} onAnswer={send} disabled={isLoading} />;
          }
          const feedback = (event) => sendFeedback(entry, event);
          return (
            <div
              key={`${requestId ?? "canvas"}-${widget.type}`}
              className="relative"
              onClickCapture={(event) => {
                const control = event.target.closest("button, a");
                if (control && !control.dataset.dismissWidget) feedback("CLICKED");
              }}
            >
              <WidgetRenderer widget={widget} onSheetOpenChanged={setIsSheetOpen}
                onActionCompleted={() => feedback("COMPLETED")} />
              {requestId && (
                <button
                  type="button"
                  data-dismiss-widget="true"
                  aria-label={`${widget.title || "이 기능"} 닫기`}
                  onClick={() => dismiss(entry)}
                  className="mt-1 block ml-auto px-2 py-1 text-caption-1 text-darkgray underline"
                >
                  이 기능 닫기
                </button>
              )}
            </div>
          );
        })}
      </section>

      <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[375px] px-[10px] pb-[12px] ${isSheetOpen ? "hidden" : ""}`}>
        <Chat key={chatVersion} onSend={send} isLoading={isLoading}
          clarification={hasClarification} />
      </div>
    </section>
  );
}

export default ChatPage;
