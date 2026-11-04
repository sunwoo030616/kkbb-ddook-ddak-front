import { useState } from 'react';
import { Icon } from '@iconify/react';

export default function Chat({ onSubmit, isLoading = false }) {
  const [message, setMessage] = useState('');
  const send = async () => {
    if (!message.trim() || isLoading) return;
    const sent = message.trim();
    if (await onSubmit(sent)) setMessage('');
  };
  return <div className="flex w-full items-center gap-3 rounded-button bg-white p-[18px] shadow-md">
    <textarea aria-label="금융 상황 입력" value={message} onChange={event => setMessage(event.target.value)}
      onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }}
      placeholder={isLoading ? '깨비가 화면을 구성하고 있어요…' : '필요한 상황을 자유롭게 말해주세요.'}
      rows={1} disabled={isLoading} className="min-h-6 max-h-[120px] min-w-0 flex-1 resize-none bg-transparent text-body-2 leading-6 outline-none placeholder:text-gray" />
    <button type="button" onClick={send} disabled={isLoading || !message.trim()} aria-label="메시지 전송"
      className="flex h-7 w-7 shrink-0 items-center justify-center disabled:opacity-40">
      <Icon icon="mingcute:send-fill" className="h-6 w-6 text-gray" />
    </button>
  </div>;
}
