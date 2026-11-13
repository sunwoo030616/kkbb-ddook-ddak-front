const canvasUrl = import.meta.env.VITE_CHAT_API_URL || "/api/canvas";

export const sessionStorageKey = `kkbb:canvas-session:${canvasUrl}`;

function apiUrl(path) {
  return new URL(path, new URL(canvasUrl, window.location.href)).href;
}

async function post(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    const message = data?.message || data?.error;
    const error = new Error(typeof message === "string" ? message : "요청을 처리하지 못했어요. 다시 시도해 주세요.");
    error.code = data?.error;
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function createCanvas(message, sessionId) {
  const data = await post(canvasUrl, { message, ...(sessionId && { sessionId }) });
  return { data, receivedAt: Date.now() };
}

let presentationToken;
let pendingPresentationToken;

async function getPresentationToken() {
  if (presentationToken) return presentationToken;
  pendingPresentationToken ??= post(apiUrl("presentation/token"), {})
    .then(({ accessToken }) => {
      if (typeof accessToken !== "string" || !accessToken) throw new Error("시연 토큰을 받지 못했어요.");
      presentationToken = accessToken;
      return accessToken;
    })
    .finally(() => { pendingPresentationToken = null; });
  return pendingPresentationToken;
}

async function postPresentationAction(path, body, headers = {}) {
  const token = await getPresentationToken();
  try {
    return await post(apiUrl(path), body, { ...headers, Authorization: `Bearer ${token}` });
  } catch (error) {
    if (error.status === 401 && presentationToken === token) presentationToken = null;
    throw error;
  }
}

export function prepareCardFreeze(action, key) {
  return postPresentationAction("actions", { type: action.type, params: action.params }, { "Idempotency-Key": key });
}

export function confirmCardFreeze(actionId, otp) {
  return postPresentationAction(`actions/${encodeURIComponent(actionId)}/confirm`, otp ? { otp } : {});
}

export function recordFeedback(requestId, widgetType, event) {
  if (!requestId) return;
  // 피드백 전송 실패는 화면 이용이나 카드 정지에 영향을 주지 않는다.
  void post(apiUrl("feedback"), { requestId, widgetType, event }).catch(() => {});
}
