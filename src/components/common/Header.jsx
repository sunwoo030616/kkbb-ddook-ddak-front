// src/components/common/Header.jsx
import { useState } from "react";
import { login, logout, oidcConfigured, oidcRequested } from "../../lib/auth.js";
import star from "../../assets/logo/star.svg";
import { Icon } from "@iconify/react";

function Header({ user, authReady }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function authenticate() {
    setBusy(true);
    setError("");
    try {
      if (user) await logout();
      else await login();
    } catch {
      setError(user ? "인증 서비스에서 로그아웃을 완료하지 못했어요." : "로그인 화면을 열지 못했어요.");
      setBusy(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex justify-between h-14 items-center bg-white px-5">
        <button className="mr-2">
          <Icon icon="heroicons:arrow-left-16-solid" className="h-6 w-6" />
        </button>
        <div className="flex items-start">
          <h1 className="text-header text-darkgray">
          깨비뚝딱
          </h1>
          <img src={star} alt="Star" className="ml-2" />
        </div>
        {oidcConfigured ? (
          <div className="flex min-w-0 items-center gap-2">
            {user && <span className="max-w-24 truncate text-caption-1">{user.profile.preferred_username || user.profile.name || "로그인됨"}</span>}
            <button type="button" disabled={!authReady || busy} onClick={authenticate}
              className="shrink-0 rounded-button bg-yellow px-2 py-1 text-body-2 disabled:opacity-50">
              {user ? "로그아웃" : "로그인"}
            </button>
          </div>
        ) : (
         <button className="mr-2">
            <Icon icon="ci:hamburger-md" className="h-6 w-6" />
          </button>
        )}
      </header>
      {(error || (oidcRequested && !oidcConfigured)) && (
        <p role="alert" className="px-5 py-2 text-body-2 text-darkgray">{error || "로그인 설정이 완료되지 않았어요."}</p>
      )}
    </>
  );
}

export default Header;
