import type { Settings } from "./schemas";

export type Contact = Settings["contacts"][number];

/** The first message a guest sends, already typed for them. */
export const GUEST_MESSAGE = "Hi! I'd like to visit a Talk-Masters meeting as a guest.";

/** For a question rather than a booking: the phone menu's "Talk to us". */
export const QUESTION_MESSAGE = "Hi! I have a question about Talk-Masters Club.";

/** The subject line an email to the club starts with. */
export const EMAIL_SUBJECT = "Question about Talk-Masters Club";

/** A mailto: link that opens the visitor's email app with the subject filled in. */
export function mailtoLink(email: string, subject: string = EMAIL_SUBJECT): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** A wa.me link that opens a chat with the number and, optionally, a message ready to send. */
export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`;
}

/** "+971502837168" → "+971 50 283 7168". Other countries are shown as stored. */
export function formatPhone(number: string): string {
  const uae = /^\+971(\d{2})(\d{3})(\d{4})$/.exec(number);
  return uae ? `+971 ${uae[1]} ${uae[2]} ${uae[3]}` : number;
}
