interface NextStepsProps {
  contactName: string;
  /** "10:15 am" */
  arriveTime: string;
  /** e.g. "Free parking on Sundays. Breakfast included." */
  arriveNote: string;
  /** After "Open in WhatsApp": the guest is on step 2, pressing send. */
  sent: boolean;
}

/** "What happens next?": the whole booking spelled out, so nothing is left to guess. */
export function NextSteps({ contactName, arriveTime, arriveNote, sent }: NextStepsProps) {
  const steps = [
    { title: "Open WhatsApp", text: "Your message is already written for you." },
    { title: "Press send", text: `It goes straight to ${contactName}.` },
    { title: "We save your seat", text: `${contactName} replies on WhatsApp to confirm.` },
    { title: `Arrive from ${arriveTime}`, text: arriveNote },
  ];
  const current = sent ? 1 : 0;

  return (
    <div>
      <h2 className="text-sm font-semibold text-white">What happens next?</h2>
      <ol className="mt-4 grid gap-4">
        {steps.map((step, index) => {
          const state = index < current ? "done" : index === current ? "current" : "upcoming";
          return (
            <li
              key={step.title}
              aria-current={state === "current" ? "step" : undefined}
              data-state={state}
              className="group flex gap-4"
            >
              <span
                aria-hidden="true"
                className="group-data-[state=current]:bg-gold group-data-[state=current]:text-ink group-data-[state=current]:border-gold group-data-[state=done]:border-gold/60 group-data-[state=done]:text-gold inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 font-serif text-sm tabular-nums transition-colors duration-(--duration-quick)"
              >
                {index + 1}
              </span>
              <span className="pt-1 leading-snug">
                <span className="block font-semibold text-white">{step.title}</span>
                <span className="text-muted block text-sm">{step.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
