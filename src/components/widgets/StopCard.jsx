import { useRef, useState } from "react";
import Title from "../Title.jsx";
import alert from "../../assets/icons/alert.svg";
import { confirmCardFreeze, prepareCardFreeze } from "../../lib/canvasApi.js";

const TERMINAL_ERRORS = new Set(["EXPIRED", "LOCKED", "DENIED", "NOT_FOUND", "EXECUTION_FAILED"]);

function StopCard({ title = "보유 카드 일괄 정지", cards = [], action, onActionCompleted }) {
  const canRun = action?.type === "CARD_FREEZE_ALL";
  const [prepared, setPrepared] = useState(null);
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef(null);
  const operation = useRef(false);
  const idempotencyKey = useRef(null);

  function open() {
    setError("");
    dialog.current.showModal();
  }

  async function execute() {
    if (operation.current || !canRun) return;
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      let pending = prepared;
      if (!pending) {
        idempotencyKey.current ??= crypto.randomUUID();
        pending = await prepareCardFreeze(action, idempotencyKey.current);
        if (pending.status === "DENIED") {
          setError(pending.reasons?.join(" ") || "지금은 카드 정지 요청을 처리할 수 없어요.");
          idempotencyKey.current = null;
          return;
        }
        setPrepared(pending);
        if (pending.otpRequired) return;
      }
      const confirmed = pending.status === "EXECUTED"
        ? pending : await confirmCardFreeze(pending.actionId, otp);
      if (confirmed.status !== "EXECUTED") throw new Error("카드 정지 결과를 확인하지 못했어요.");
      setResult(confirmed.result ?? {});
      onActionCompleted?.();
      dialog.current.close();
    } catch (error) {
      if (error.status === 401 || TERMINAL_ERRORS.has(error.code)) {
        setPrepared(null);
        setOtp("");
        idempotencyKey.current = null;
      }
      setError(error instanceof TypeError ? "서버에 연결하지 못했어요. 다시 시도해 주세요." : error.message);
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-card bg-white px-4 py-5">
      <Title icon={alert} title={title} />
      {cards.map(({ cardName }) => (
        <div key={cardName} className="rounded-button bg-background p-3 text-body-2 text-darkgray">{cardName}</div>
      ))}

      {result ? (
        <p role="status" className="text-body-2 text-darkgray">
          시연 카드 {result.frozenCards?.length ?? cards.length}장의 정지가 완료됐어요.
        </p>
      ) : canRun ? (
        <button type="button" onClick={open} className="rounded-button bg-yellow px-4 py-3 text-title text-darkgray">
          카드 일괄 정지
        </button>
      ) : (
        <p className="text-caption-1 text-gray">카드 정지는 KB스타뱅킹 앱에서 진행해 주세요.</p>
      )}

      <dialog ref={dialog} aria-labelledby="card-freeze-title"
        onCancel={(event) => { if (operation.current) event.preventDefault(); }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[340px] rounded-card bg-white p-5 text-darkgray shadow-xl backdrop:bg-black/40">
        <form onSubmit={(event) => { event.preventDefault(); void execute(); }}>
          <h2 id="card-freeze-title" className="text-title">{prepared?.otpRequired ? "인증번호를 입력해 주세요" : "보유 카드를 정지할까요?"}</h2>
          <p className="mt-2 text-body-2">시연용 요청이에요. 실제 카드는 정지되지 않아요.</p>
          {prepared?.otpRequired && (
            <label className="mt-4 block text-body-2">
              인증번호
              <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric" autoComplete="one-time-code" disabled={busy}
                className="mt-1 block w-full rounded-button bg-background p-2" />
              {prepared.demoOtp && <span className="mt-1 block text-caption-1">시연용 인증번호 {prepared.demoOtp}</span>}
            </label>
          )}
          {error && <p role="alert" className="mt-3 text-body-2">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button type="button" disabled={busy} onClick={() => dialog.current.close()}
              className="flex-1 rounded-button bg-background p-2">취소</button>
            <button type="submit" disabled={busy || (prepared?.otpRequired && otp.length !== 6)}
              className="flex-1 rounded-button bg-yellow p-2 font-semibold disabled:opacity-50">
              {busy ? "처리 중…" : "정지 확인"}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

export default StopCard;
