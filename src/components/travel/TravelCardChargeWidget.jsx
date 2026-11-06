import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Title from "../Title.jsx";
import dollar from "../../assets/icons/dollar.svg";
import kkaebiFace from "../../assets/logo/kkaebi-face.svg";

function TravelCardChargeWidget({
  title,
  currency,
  cardBalance,
  chargeButtonLabel,
  exchangeRate,
  rateDescription,
  quickAmounts = [100, 500, 1000],
  suggestedAmount = 2000,
  estimatedKrw = 378400,
  onSheetOpenChanged,
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [amount, setAmount] = useState(suggestedAmount);

  const sheetRef = useRef(null);

  const handleToggleSheet = () => {
    setIsSheetOpen((prev) => {
      const next = !prev;
      onSheetOpenChanged?.(next);
      return next;
    });
  };

  const handleQuickAmount = (value) => {
    setAmount((prev) => prev + value);
  };

  const handleDigit = (digit) => {
    setAmount((prev) => {
      const next = prev === 0 ? String(digit) : String(prev) + String(digit);
      return Number(next);
    });
  };

  const handleBackspace = () => {
    setAmount((prev) => {
      const value = String(prev);
      if (value.length <= 1) return 0;
      return Number(value.slice(0, -1));
    });
  };

  const handleCharge = () => {
    setIsSheetOpen(false);
    onSheetOpenChanged?.(false);
  };

  return (
    <>
      <section className="flex flex-col gap-3 rounded-card bg-white px-4 py-5">
        <div className="flex items-center gap-2">
          <Title icon={dollar} title={title} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between rounded-card bg-background px-4 py-4">
            <span className="text-body-2 text-darkgray">
              내 트래블 카드 잔액 : {cardBalance} {currency}
            </span>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleToggleSheet}
                className="rounded-[8px] bg-yellow px-2 py-3 text-body-1 text-darkgray"
              >
                {chargeButtonLabel}
              </button>
            </div>
          </div>

          <span className="px-1 text-caption-1 text-gray">
            현재 환율 1 {currency} = 약 {exchangeRate}원 ({rateDescription})
          </span>
        </div>
      </section>

      <div className={`fixed inset-0 z-50 flex items-end justify-center ${isSheetOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isSheetOpen ? "opacity-100" : "opacity-0"}`}
          onClick={handleToggleSheet}
        />

        <div
          ref={sheetRef}
          className={`relative w-[375px] h-[654px] rounded-t-[24px] bg-white p-4 shadow-2xl transition-transform duration-300 ${
            isSheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-4 flex flex-col gap-2">
            <span className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
            <p className="text-header font-semibold">위안화 충전하기</p>
          </div>

          <div className="rounded-card bg-background px-4 py-4">
            <div className="flex items-end gap-2">
              <p className="text-[32px] font-bold text-darkgray">{amount.toLocaleString()}</p>
              <p className="text-header text-gray py-1">{currency}</p>
            </div>
            <p className="mt-2 text-caption-1 text-gray">
              환율 1 {currency} = {exchangeRate.toFixed(2)}원 ({rateDescription})
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleQuickAmount(value)}
                className="flex items-center justify-center rounded-[20px] border border-gray px-3 py-2 text-body-2 text-gray"
              >
                +{value} {currency}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="flex h-[64px] w-[104px] items-center justify-center rounded-[12px] bg-background text-[24px] font-suit text-gray"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="flex h-[64px] w-[104px] items-center justify-center rounded-[12px] bg-background"
            >
              <img src={kkaebiFace} alt="kkaebi face" className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={() => handleDigit(0)}
              className="flex h-[64px] w-[104px] items-center justify-center rounded-[12px] bg-background text-[24px] font-suit text-gray"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="flex h-[64px] w-[104px] items-center justify-center rounded-[12px] bg-background"
            >
              <Icon icon="solar:backspace-outline" className="h-6 w-6 text-darkgray" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCharge}
            className="mt-4 w-full rounded-button bg-yellow px-4 py-4 text-title text-darkgray"
          >
            {chargeButtonLabel}
          </button>
        </div>
      </div>
    </>
  );
}

export default TravelCardChargeWidget;