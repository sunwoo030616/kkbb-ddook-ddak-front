// src/pages/MainPage.jsx
import { useState } from "react";
import Chat from "../components/Chat.jsx";
import WidgetRenderer from "../components/WidgetRenderer.jsx";

function ChatPage() {
  const [widgets, setWidgets] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleWidgetsReceived = (receivedWidgets) => {
    setWidgets(receivedWidgets);
  };

  return (
    <main className="flex min-h-dvh flex-col gap-3 px-[10px] pb-[110px]">
      <section className="flex flex-col gap-3">
        {widgets.map((widget, index) => (
          <WidgetRenderer
            key={`${widget.type}-${index}`}
            widget={widget}
            onSheetOpenChanged={setIsSheetOpen}
          />
        ))}
      </section>

      <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[375px] px-[10px] pb-[12px] ${isSheetOpen ? "hidden" : ""}`}>
        <Chat onWidgetsReceived={handleWidgetsReceived} />
      </div>
    </main>
  );
}

export default ChatPage;