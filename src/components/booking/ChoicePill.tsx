import type { ReactNode } from "react";

interface ChoicePillProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  children: ReactNode;
}

/** One option in a radio group, drawn as a pill. Selecting the checked pill again clears it. */
export function ChoicePill({ name, value, checked, onSelect, children }: ChoicePillProps) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        onClick={() => checked && onSelect("")}
        className="peer sr-only"
      />
      <span className="peer-checked:bg-gold peer-checked:border-gold peer-checked:text-ink peer-focus-visible:outline-gold hover:border-gold/70 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-[0.9375rem] transition-colors duration-(--duration-quick) peer-checked:font-semibold peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2">
        {children}
      </span>
    </label>
  );
}
