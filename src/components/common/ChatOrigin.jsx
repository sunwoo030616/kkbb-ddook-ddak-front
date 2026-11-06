import kkaebi from "../../assets/logo/kkaebi.svg";

function ChatOrigin() {
  const chips = [
    "지갑을 분실했어요",
    "축제 주점 정산하기",
    "이사 당일 이체 준비",
  ];

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center text-center">
        <h1 className="text-header font-bold text-[22px] text-darkgray">
          어떤 금융 서비스가 필요하신가요?
        </h1>
        <img
          src={kkaebi}
          alt="Kkaebi"
          className="absolute -top-[130px] right-[0px] h-[115px] w-auto object-contain"
          style={{ filter: "drop-shadow(0 0 18px rgba(255, 215, 0, 0.75))" }}
        />
        <span className="mt-2 text-body-2 text-gray">
          상황을 말씀해주시면 딱 맞는 화면을 뚝딱해 드릴게요.
        </span>

        <div className="mt-4 w-[min(92vw,335px)] overflow-hidden px-2">
          <div className="marquee-track flex items-center gap-3 whitespace-nowrap">
            {[...chips, ...chips].map((label, index) => (
              <button
                key={`${label}-${index}`}
                type="button"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-body-2 text-darkgray"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee 12s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default ChatOrigin;