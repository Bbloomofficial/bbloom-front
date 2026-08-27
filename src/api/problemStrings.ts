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
  emailTaken:
    "There's already an account with this email. Sign in, or confirm the address if you never finished signing up.",
  emailNotVerified:
    "This address hasn't been confirmed yet. Enter the code we emailed you.",
  slugReserved: "That address is reserved by bbloom. Please choose another one.",
  memberAccountMissing:
    "Nobody with this email has a bbloom account yet. Ask them to sign up first, then invite them.",
  memberNameRequired:
    "Give this person's name so we can create their account.",
  promoUnknown: "We don't recognise that code. Check it and try again.",
  promoExpired: "That code has expired.",
  promoNotForPlan: "That code doesn't apply to this plan.",
  promoLimitReached: "That code has been used the maximum number of times.",
  throttled: "Too many attempts. Wait a moment and try again.",
  signInThrottled:
    "Signing in to this account is paused for a moment. Please try again shortly.",
  signInThrottledFor: (minutes) =>
    `Signing in to this account is paused for a moment. Please try again in ${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    }.`,
  signUpThrottled:
    "There have been too many sign-up attempts from this connection. Please try again shortly.",
  signUpThrottledFor: (minutes) =>
    `There have been too many sign-up attempts from this connection. Please try again in ${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    }.`,
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
  emailTaken:
    "ამ ელფოსტით ანგარიში უკვე არსებობს. შედით ან დაადასტურეთ მისამართი, თუ რეგისტრაცია ბოლომდე არ დაასრულეთ.",
  emailNotVerified:
    "ეს მისამართი ჯერ არ არის დადასტურებული. შეიყვანეთ კოდი, რომელიც გამოგიგზავნეთ.",
  slugReserved: "ეს მისამართი დაცულია bbloom-ის მიერ. აირჩიეთ სხვა.",
  memberAccountMissing:
    "ამ ელფოსტით bbloom-ის ანგარიში ჯერ არავის აქვს. სთხოვეთ დარეგისტრირდეს და შემდეგ მოიწვიეთ.",
  memberNameRequired:
    "მიუთითეთ ამ ადამიანის სახელი, რომ ანგარიში შევქმნათ.",
  promoUnknown: "ასეთი კოდი ვერ ვიპოვეთ. შეამოწმეთ და სცადეთ თავიდან.",
  promoExpired: "ამ კოდს ვადა გაუვიდა.",
  promoNotForPlan: "ეს კოდი ამ პაკეტზე არ მოქმედებს.",
  promoLimitReached: "ეს კოდი უკვე მაქსიმალურად არის გამოყენებული.",
  throttled: "ბევრი მცდელობა იყო. მოიცადეთ და სცადეთ თავიდან.",
  signInThrottled: "ამ ანგარიშზე შესვლა დროებით შეჩერებულია. სცადეთ ცოტა ხანში.",
  signInThrottledFor: (minutes) =>
    `ამ ანგარიშზე შესვლა დროებით შეჩერებულია. სცადეთ ${minutes} წუთში.`,
  signUpThrottled:
    "ამ ქსელიდან რეგისტრაციის ბევრი მცდელობა იყო. სცადეთ ცოტა ხანში.",
  signUpThrottledFor: (minutes) =>
    `ამ ქსელიდან რეგისტრაციის ბევრი მცდელობა იყო. სცადეთ ${minutes} წუთში.`,
  server: "ჩვენს მხარეს რაღაც ვერ გამოვიდა. სცადეთ თავიდან.",
};

const dictionaries: Record<Locale, ProblemStrings> = { en, ka };

export function problemStrings(locale: Locale): ProblemStrings {
  return dictionaries[locale] ?? ka;
}
