import { useState } from "react";
import Title from "../Title.jsx";
import Button from "../Button.jsx";
import wallet from "../../assets/icons/wallet.svg";
import copy from "../../assets/icons/copy.svg";

function AtmNum() {
  const [copied, setCopied] = useState(false);
  const authCode = "987 654";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(authCode.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("복사 실패", error);
    }
  };

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-card bg-white px-4 py-5">
      <Title icon={wallet} title="카드 없는 스마트 출금" />
      <span className="text-caption-1 text-gray">
        인증번호를 ATM에 입력하세요.
      </span>

      <div className="flex w-full flex-col items-start rounded-button bg-background p-4">
        <span className="text-title text-darkgray">출금 인증번호</span>
        <span className="mt-1 text-caption-1 text-gray">복사해서 사용하세요.</span>

        <div className="mt-3 flex w-full items-center justify-between gap-3">
          <span className="whitespace-nowrap text-[32px] font-semibold leading-none tracking-[0%] text-darkgray">
            {authCode}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center rounded-full bg-background p-2"
              aria-label="인증번호 복사"
            >
              <img src={copy} alt="copy" className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full bg-background px-3 py-2 text-caption-1 text-yellow"
            >
              30:00
            </button>
          </div>
        </div>
        {copied && <span className="mt-2 text-caption-1 text-gray">복사되었습니다.</span>}
      </div>

      <span className="text-body-2 text-gray">
        보안을 위해 인증번호는 자동 폐기합니다
      </span>

    </div>
  );
}

export default AtmNum;
