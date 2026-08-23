/**
 * The one set of sentences we show when a request fails, shared by every
 * surface that talks to the API — the dashboard, the page editor, the
 * anonymous try-it editor.
 *
 * They live here rather than in each surface's dictionary because a failure is
 * the same failure wherever it happens, and three copies of "wrong email or
 * password" is three chances for them to drift apart in one language only.
 */

import type { Locale } from "../i18n";
import type { ProblemStrings } from "./problem";

const en: ProblemStrings = {
  network: "We couldn't reach bbloom. Check your connection and try again.",
  validation: "Some of the fields need fixing.",
  malformed: "We couldn't send that. Please reload the page and try again.",
  fieldRequired: "Please fill this in.",
  fieldInvalid: "This doesn't look right.",
  fieldEmail: "Enter a valid email address.",
  fieldPasswordLength: "Your password needs at least 8 characters.",
  fieldTooLong: (max) => `This is too long — ${max} characters at most.`,
  fieldLengthRange: (min, max) =>
    `This needs to be between ${min} and ${max} characters.`,
  fieldTooShort: (min) => `This needs at least ${min} characters.`,
  fieldPattern: "This isn't in the right format.",
  fieldNumber: "Enter a larger number.",
  credentials: "Wrong email or password.",
  session: "You've been signed out. Sign in again to continue.",
  forbidden: "Only the website's owner can do this.",
  notFound: "We couldn't find that.",
  emailTaken: "There's already an account with this email. Sign in instead.",
  throttled: "Too many attempts. Wait a moment and try again.",
  server: "Something went wrong on our side. Please try again.",
};

const ka: ProblemStrings = {
  network:
    "bbloom-თან კავშირი ვერ დამყარდა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.",
  validation: "ზოგიერთი ველი შესასწორებელია.",
  malformed: "მოთხოვნა ვერ გაიგზავნა. გადატვირთეთ გვერდი და სცადეთ თავიდან.",
  fieldRequired: "შეავსეთ ეს ველი.",
  fieldInvalid: "მნიშვნელობა არასწორია.",
  fieldEmail: "შეიყვანეთ სწორი ელფოსტა.",
  fieldPasswordLength: "პაროლი მინიმუმ 8 სიმბოლოსგან უნდა შედგებოდეს.",
  fieldTooLong: (max) => `ძალიან გრძელია — მაქსიმუმ ${max} სიმბოლო.`,
  fieldLengthRange: (min, max) => `უნდა იყოს ${min}–${max} სიმბოლო.`,
  fieldTooShort: (min) => `მინიმუმ ${min} სიმბოლო უნდა იყოს.`,
  fieldPattern: "ფორმატი არასწორია.",
  fieldNumber: "შეიყვანეთ უფრო დიდი რიცხვი.",
  credentials: "ელფოსტა ან პაროლი არასწორია.",
  session: "სესია დასრულდა. გთხოვთ, თავიდან შეხვიდეთ.",
  forbidden: "ამის გაკეთება მხოლოდ ვებგვერდის მფლობელს შეუძლია.",
  notFound: "ვერ მოიძებნა.",
  emailTaken: "ამ ელფოსტით ანგარიში უკვე არსებობს. უბრალოდ შედით.",
  throttled: "ბევრი მცდელობა იყო. მოიცადეთ და სცადეთ თავიდან.",
  server: "ჩვენს მხარეს რაღაც ვერ გამოვიდა. სცადეთ თავიდან.",
};

const dictionaries: Record<Locale, ProblemStrings> = { en, ka };

export function problemStrings(locale: Locale): ProblemStrings {
  return dictionaries[locale] ?? ka;
}
