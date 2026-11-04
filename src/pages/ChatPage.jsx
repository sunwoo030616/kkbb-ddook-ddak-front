import { useRef, useState } from 'react';
import Chat from '../components/Chat.jsx';
import ChatOrigin from '../components/common/ChatOrigin.jsx';
import WidgetRenderer from '../components/WidgetRenderer.jsx';
import kkaebiFace from '../assets/logo/kkaebi-face.svg';
import { acceptScreen, composeScreen, retainInputValues } from '../lib/canvasClient.js';

export default function ChatPage() {
  const [screen, setScreen] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('queued');
  const [inputValues, setInputValues] = useState({});
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sending = useRef(false);

  const submit = async (message, calculation) => {
    if (sending.current) return false;
    sending.current = true; setLoading(true); setError('');
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', text: message }]);
    try {
      const result = await composeScreen(message, screen, calculation, setStage);
      const accepted = acceptScreen(screen, result);
      if (result.status === 'composed') {
        setScreen(accepted);
        setInputValues(previous => retainInputValues(previous, accepted));
      }
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'assistant', text: result.greeting || '필요한 금융 화면을 확인하고 있어요.' }]);
      return true;
    } catch (failure) {
      setError(failure.message); return false;
    } finally { sending.current = false; setLoading(false); }
  };

  return <main className="flex min-h-[calc(100dvh-104px)] flex-col gap-3 pb-[110px]">
    {!messages.length && !screen && <ChatOrigin onSuggestion={submit} disabled={isLoading} />}
    <section aria-label="대화" className="flex flex-col gap-3">
      {messages.map(message => <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[90%] rounded-card rounded-br-none bg-yellow px-4 py-3 text-body-2' : 'flex items-start gap-2 text-body-2 leading-6 text-darkgray'}>
        {message.role === 'assistant' && <img src={kkaebiFace} className="mt-1 h-7 w-7 shrink-0" alt="깨비" />}
        <span>{message.text}</span>
      </div>)}
      {isLoading && <p role="status" className="py-3 text-body-2 text-gray">{({ queued: '요청을 준비하고 있어요…', context: '이전 대화와 이번 상황을 함께 확인하고 있어요…', understanding: '요청한 일과 제외할 조건을 확인하고 있어요…', component_retrieval: '필요한 금융 기능을 찾고 있어요…', planning: '상황에 맞는 화면을 설계하고 있어요…', repair: '화면 구성을 다시 확인하고 있어요…', reviewing: '요청한 기능과 제외 조건을 다시 검토하고 있어요…', refining: '검토 결과를 반영해 화면을 다듬고 있어요…', evidence: '공식 자료에서 필요한 근거를 확인하고 있어요…', binding: '입력값과 금융 기능을 연결하고 있어요…', committing: '화면을 반영하고 있어요…' })[stage] || '화면을 구성하고 있어요…'}</p>}
    </section>
    {error && <p role="alert" className="rounded-card bg-white p-4 text-body-2 text-red-700">{error}</p>}
    <section aria-label="맞춤 금융 화면" className="flex flex-col gap-3">
      {(screen?.widgets || []).map(widget => <WidgetRenderer key={widget.id || widget.type} widget={widget}
        values={inputValues[widget.id] || {}}
        onValuesChange={values => setInputValues(previous => ({ ...previous, [widget.id]: values }))}
        onSubmit={submit} busy={isLoading} onSheetOpenChanged={setIsSheetOpen} />)}
    </section>
    <div className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[375px] bg-background/90 px-[10px] pb-[12px] pt-2 ${isSheetOpen ? 'hidden' : ''}`}>
      <Chat onSubmit={submit} isLoading={isLoading} />
      {screen && <button disabled={isLoading} onClick={() => { setScreen(null); setMessages([]); setError(''); setInputValues({}); }} className="mt-2 w-full text-center text-caption-1 text-gray">새 대화 시작</button>}
    </div>
  </main>;
}
