import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const authority = import.meta.env.VITE_OIDC_ISSUER?.trim();
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID?.trim();
export const oidcConfigured = Boolean(authority && clientId);
export const oidcRequested = Boolean(authority || clientId);

const origin = window.location.origin;
const manager = oidcConfigured ? new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: origin + "/auth/callback",
  post_logout_redirect_uri: origin + "/auth/logout",
  response_type: "code",
  scope: "openid profile actions:execute",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: false,
  monitorSession: false,
}) : null;

let current = { user: null, ready: !manager };
const listeners = new Set();
let callback;

function update(user) {
  current = { user: user?.expired ? null : user, ready: true };
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAuth() {
  return current;
}

if (manager) {
  manager.events.addUserLoaded(update);
  manager.events.addUserUnloaded(() => update(null));
  manager.events.addAccessTokenExpired(() => update(null));
  void manager.getUser().then(update, () => update(null));
}

export function login() {
  return manager.signinRedirect();
}

export async function logout() {
  const user = await manager.getUser();
  await manager.removeUser();
  return manager.signoutRedirect({ id_token_hint: user?.id_token });
}

export function finishAuthRedirect(isLogout) {
  callback ??= Promise.resolve().then(() => {
    if (!manager) throw new Error("OIDC is not configured");
    return isLogout ? manager.signoutRedirectCallback() : manager.signinRedirectCallback();
  });
  return callback;
}

export async function actionAccessToken() {
  const user = await manager?.getUser();
  if (!user?.access_token || user.expired) {
    throw Object.assign(new Error("카드를 정지하려면 로그인해 주세요."), { status: 401 });
  }
  return user.access_token;
}

export async function invalidateActionToken(token) {
  const user = await manager?.getUser();
  if (user?.access_token === token) await manager.removeUser();
}
