export const SUPPORTED_WIDGETS = [
  'travel_card_charge_widget', 'overseas_qr_payment_widget', 'travel_insurance_widget',
  'group_account_status', 'expense_report_widget', 'group_card_safety_widget',
  'card_freeze_all', 'atm_smart_withdrawal', 'id_reissue_status_widget',
  'funding_inputs_widget', 'funding_comparison_widget', 'loan_inputs_widget',
  'loan_repayment_schedule_widget', 'deposit_protection_widget', 'card_recovery_widget', 'autopay_relink_widget',
];

export function requestBody(message, screen, calculation) {
  const body = { message, expected_revision: screen?.revision ?? 0, supported_widgets: SUPPORTED_WIDGETS,
    retrieval_mode: 'multi', review_mode: 'off', intent_mode: 'auto', evidence_mode: 'once' };
  if (screen?.session_id) body.session_id = screen.session_id;
  if (calculation) body.calculation = calculation;
  return body;
}

export function acceptScreen(previous, incoming) {
  if (incoming.status !== 'composed') return previous;
  if (!Array.isArray(incoming.widgets) || incoming.widgets.some(w => !SUPPORTED_WIDGETS.includes(w.type))) {
    throw new Error('화면 구성 형식을 확인하지 못했어요. 기존 화면을 유지할게요.');
  }
  if (previous && (incoming.session_id !== previous.session_id || incoming.revision <= previous.revision)) {
    throw new Error('이전 화면 응답이 도착했어요. 현재 화면을 유지할게요.');
  }
  return incoming;
}

export function retainInputValues(values, screen) {
  const active = new Set((screen?.widgets || []).map(widget => widget.id));
  return Object.fromEntries(Object.entries(values).filter(([id]) => active.has(id)));
}


export async function composeScreen(message, screen, calculation, onProgress = () => {}) {
  const base = (import.meta.env?.VITE_CHAT_API_URL || '/api/canvas/v2').replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180000);
  const signal = controller.signal;
  const body = JSON.stringify({ request: requestBody(message, screen, calculation), client_request_id: crypto.randomUUID() });
  async function read(response) {
    const value = await response.json();
    if (!response.ok) {
      if (response.status === 409) throw new Error('화면이 이미 변경되었어요. 새 대화에서 다시 시작해주세요.');
      throw new Error(typeof value.detail === 'string' ? value.detail : value.error || '화면 구성을 연결하지 못했어요. 기존 화면을 유지할게요.');
    }
    return value;
  }
  try {
    let response;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try { response = await fetch(base + '/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal }); break; }
      catch (error) { if (attempt || signal.aborted) throw error; }
    }
    const submitted = await read(response);
    while (!signal.aborted) {
      let polled;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try { polled = await fetch(base + '/jobs/' + submitted.job_id, { signal }); break; }
        catch (error) {
          if (attempt === 2 || signal.aborted) throw error;
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        }
      }
      const job = await read(polled);
      onProgress(job.stage);
      if (job.status === 'completed') return job.result;
      if (job.status === 'failed') throw new Error(job.error?.message || '화면을 구성하지 못했어요. 기존 화면을 유지할게요.');
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    throw new Error('시간이 오래 걸리고 있어요. 기존 화면은 유지했어요. 잠시 후 다시 시도해주세요.');
  } catch (error) {
    if (signal.aborted) throw new Error('시간이 오래 걸리고 있어요. 기존 화면은 유지했어요. 잠시 후 다시 시도해주세요.', { cause: error });
    throw error;
  } finally { clearTimeout(timer); }
}
