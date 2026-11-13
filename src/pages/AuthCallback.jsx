import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { finishAuthRedirect } from "../lib/auth.js";

export default function AuthCallback({ logout = false }) {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    finishAuthRedirect(logout).then(
      () => { if (active) navigate("/", { replace: true }); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, [logout, navigate]);

  return (
    <main className="min-h-screen bg-background p-6 text-darkgray">
      {failed ? (
        <>
          <p role="alert">{logout ? "인증 서비스의 로그아웃을 확인하지 못했어요." : "로그인을 완료하지 못했어요. 다시 시도해 주세요."}</p>
          <Link to="/" replace className="underline">깨비뚝딱으로 돌아가기</Link>
        </>
      ) : (
        <p role="status">{logout ? "로그아웃 중이에요." : "로그인 중이에요."}</p>
      )}
    </main>
  );
}
