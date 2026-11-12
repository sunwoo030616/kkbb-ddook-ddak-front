function ClarificationWidget({ title, missingSlots = [], onAnswer, disabled }) {
  return (
    <section className="rounded-card border border-yellow bg-white px-4 py-5" aria-label="추가 질문">
      <h2 className="text-title text-darkgray">{title || "정보를 조금만 더 알려주세요"}</h2>
      {missingSlots.map(({ slot, question, examples }) => (
        <div key={slot} className="mt-3">
          <p className="text-body-2 text-darkgray">{question}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(examples ?? []).map((example) => (
              <button
                key={example}
                type="button"
                disabled={disabled}
                className="rounded-full bg-background px-3 py-1.5 text-caption-1 text-darkgray disabled:opacity-50"
                onClick={() => onAnswer(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default ClarificationWidget;
