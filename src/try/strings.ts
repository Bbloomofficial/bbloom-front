/**
 * Copy for the build-before-you-sign-up flow. Georgian first, English second,
 * kept beside the feature rather than in the marketing dictionary because none
 * of it is marketing: it is the instructions for an editor.
 */

import type { ProblemStrings } from "../api/problem";
import { problemStrings } from "../api/problemStrings";

export type TryStrings = {
  galleryTitle: string;
  gallerySubtitle: string;
  galleryHint: string;
  choose: string;
  resume: string;
  resumeCta: string;
  resumeBody: string;
  startOver: string;
  loading: string;
  loadFailed: string;
  retry: string;

  editorBack: string;
  sections: string;
  businessName: string;
  businessNameHint: string;
  preview: string;
  desktop: string;
  mobile: string;
  replaceImage: string;
  imageTooLarge: string;
  imageFailed: string;
  draftFull: string;
  savedLocally: string;
  reset: string;
  resetAll: string;
  resetAllConfirm: string;
  noFields: string;
  edits: string;
  content: string;
  modeEdit: string;
  modeReview: string;
  hotspotText: string;
  hotspotImage: string;
  imageTitle: string;
  imageFromFile: string;
  imageFromLink: string;
  imageLinkPlaceholder: string;
  imageLinkUse: string;
  imageLinkFailed: string;
  imageNotSavedYet: string;
  dismiss: string;

  saveCta: string;
  saveTitle: string;
  saveBody: string;
  saveSignedInTitle: string;
  /** `{email}` is replaced with the signed-in address. */
  saveSignedInBody: string;
  saveConfirm: string;
  useAnother: string;
  fullName: string;
  email: string;
  password: string;
  passwordHint: string;
  createAccount: string;
  haveAccount: string;
  signIn: string;
  cancel: string;
  working: string;
  stepCreating: string;
  stepContent: string;
  stepImages: string;
  stepPublishing: string;
  doneTitle: string;
  doneBody: string;
  doneOffline: string;
  openSite: string;
  openPanel: string;
  freeNote: string;
  /** What the visitor is told when saving their website fails. */
  saveFailed: string;
  errors: ProblemStrings;
};

const en: TryStrings = {
  galleryTitle: "Pick a design and start building",
  gallerySubtitle:
    "Change every word and every picture right away. No account needed until you want to keep it.",
  galleryHint: "Your website is free on a bbloom.ge address. Pay only for your own domain and features that need a server.",
  choose: "Use this design",
  resume: "Continue where you left off",
  resumeCta: "Continue",
  resumeBody: "You have an unsaved website in this browser.",
  startOver: "Start again",
  loading: "Loading…",
  loadFailed: "This design could not be loaded.",
  retry: "Try again",

  editorBack: "Designs",
  sections: "Sections",
  businessName: "Business name",
  businessNameHint: "Shown in the browser tab and used to name your website.",
  preview: "Preview",
  desktop: "Desktop",
  mobile: "Phone",
  replaceImage: "Replace image",
  imageTooLarge: "That image is too large. Try a smaller one.",
  imageFailed: "That file could not be read as an image.",
  draftFull:
    "No room left in this browser for more images. Create your account to keep them safely.",
  savedLocally: "Saved in this browser",
  reset: "Undo",
  resetAll: "Undo all changes",
  resetAllConfirm: "Undo every change and start from the original design?",
  noFields: "Nothing to edit in this part.",
  edits: "changed",
  content: "Content",
  modeEdit: "Editing",
  modeReview: "Preview",
  hotspotText: "Click to edit",
  hotspotImage: "Click to change the picture",
  imageTitle: "Change the picture",
  imageFromFile: "Choose a file",
  imageFromLink: "Or paste a link to a picture",
  imageLinkPlaceholder: "https://…",
  imageLinkUse: "Use this link",
  imageLinkFailed:
    "That link could not be loaded. Save the picture to your device and choose the file instead.",
  imageNotSavedYet:
    "Pictures are uploaded when you save your website, not before.",
  dismiss: "Cancel",

  saveCta: "Save my website",
  saveTitle: "Create your account to keep it",
  saveBody:
    "Your work is kept on your account, free, on a bbloom.ge address.",
  saveSignedInTitle: "Save this website",
  saveSignedInBody:
    "It will be added to {email} as a new website, free, on a bbloom.ge address.",
  saveConfirm: "Save and publish",
  useAnother: "Use a different account",
  fullName: "Your name",
  email: "Email",
  password: "Password",
  passwordHint: "At least 8 characters.",
  createAccount: "Create account and publish",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  cancel: "Not yet",
  working: "Publishing your website…",
  stepCreating: "Creating your website",
  stepContent: "Saving your text",
  stepImages: "Uploading your images",
  stepPublishing: "Putting it online",
  doneTitle: "Your website is online",
  doneBody: "Anyone can open it at this address.",
  doneOffline:
    "Your website is saved, but it could not be put online yet. Open your panel to finish it.",
  openSite: "Open my website",
  openPanel: "Go to my panel",
  freeNote:
    "Free on a bbloom.ge address. Your own domain, online orders and customer accounts are paid.",
  saveFailed: "We couldn't save your website. Please try again.",
  errors: problemStrings("en"),
};

const ka: TryStrings = {
  galleryTitle: "აირჩიეთ დიზაინი და დაიწყეთ",
  gallerySubtitle:
    "შეცვალეთ ყველა ტექსტი და სურათი მაშინვე. ანგარიში მხოლოდ მაშინ დაგჭირდებათ, როცა შენახვას მოისურვებთ.",
  galleryHint:
    "ვებგვერდი უფასოა bbloom.ge მისამართზე. გადახდა მხოლოდ საკუთარ დომენსა და სერვერზე დამოკიდებულ ფუნქციებზეა საჭირო.",
  choose: "ამ დიზაინით დაწყება",
  resume: "გააგრძელეთ იქიდან, სადაც შეჩერდით",
  resumeCta: "გაგრძელება",
  resumeBody: "ამ ბრაუზერში გაქვთ შეუნახავი ვებგვერდი.",
  startOver: "თავიდან დაწყება",
  loading: "იტვირთება…",
  loadFailed: "დიზაინი ვერ ჩაიტვირთა.",
  retry: "ხელახლა ცდა",

  editorBack: "დიზაინები",
  sections: "სექციები",
  businessName: "ბიზნესის სახელი",
  businessNameHint: "ჩანს ბრაუზერის ჩანართზე და ასახელებს თქვენს ვებგვერდს.",
  preview: "გადახედვა",
  desktop: "კომპიუტერი",
  mobile: "ტელეფონი",
  replaceImage: "სურათის შეცვლა",
  imageTooLarge: "სურათი ძალიან დიდია. სცადეთ პატარა ზომის.",
  imageFailed: "ფაილი სურათად ვერ წაიკითხა.",
  draftFull:
    "ამ ბრაუზერში მეტ სურათს ვეღარ შევინახავთ. შექმენით ანგარიში, რომ უსაფრთხოდ შეინახოთ.",
  savedLocally: "შენახულია ამ ბრაუზერში",
  reset: "დაბრუნება",
  resetAll: "ყველა ცვლილების გაუქმება",
  resetAllConfirm:
    "გავაუქმოთ ყველა ცვლილება და დავუბრუნდეთ საწყის დიზაინს?",
  noFields: "ამ ნაწილში სარედაქტირებელი არაფერია.",
  edits: "შეცვლილი",
  content: "შიგთავსი",
  modeEdit: "რედაქტირება",
  modeReview: "დათვალიერება",
  hotspotText: "დააჭირეთ შესაცვლელად",
  hotspotImage: "დააჭირეთ სურათის შესაცვლელად",
  imageTitle: "სურათის შეცვლა",
  imageFromFile: "ფაილის არჩევა",
  imageFromLink: "ან ჩასვით სურათის ბმული",
  imageLinkPlaceholder: "https://…",
  imageLinkUse: "ამ ბმულის გამოყენება",
  imageLinkFailed:
    "ბმული ვერ ჩაიტვირთა. შეინახეთ სურათი მოწყობილობაზე და აირჩიეთ ფაილი.",
  imageNotSavedYet:
    "სურათები აიტვირთება ვებგვერდის შენახვისას და არა ადრე.",
  dismiss: "გაუქმება",

  saveCta: "ვებგვერდის შენახვა",
  saveTitle: "შესანახად შექმენით ანგარიში",
  saveBody:
    "თქვენი ნამუშევარი შეინახება თქვენს ანგარიშზე, უფასოდ, bbloom.ge მისამართზე.",
  saveSignedInTitle: "შეინახეთ ეს ვებგვერდი",
  saveSignedInBody:
    "დაემატება {email}-ს როგორც ახალი ვებგვერდი, უფასოდ, bbloom.ge მისამართზე.",
  saveConfirm: "შენახვა და გამოქვეყნება",
  useAnother: "სხვა ანგარიშით შესვლა",
  fullName: "თქვენი სახელი",
  email: "ელფოსტა",
  password: "პაროლი",
  passwordHint: "მინიმუმ 8 სიმბოლო.",
  createAccount: "ანგარიშის შექმნა და გამოქვეყნება",
  haveAccount: "უკვე გაქვთ ანგარიში?",
  signIn: "შესვლა",
  cancel: "ჯერ არა",
  working: "მიმდინარეობს გამოქვეყნება…",
  stepCreating: "იქმნება თქვენი ვებგვერდი",
  stepContent: "ინახება თქვენი ტექსტები",
  stepImages: "იტვირთება თქვენი სურათები",
  stepPublishing: "ქვეყნდება ონლაინ",
  doneTitle: "თქვენი ვებგვერდი ონლაინაა",
  doneBody: "ამ მისამართზე ის ყველასთვის ხელმისაწვდომია.",
  doneOffline:
    "ვებგვერდი შენახულია, თუმცა ჯერ ვერ გამოქვეყნდა. დასასრულებლად გახსენით პანელი.",
  openSite: "ვებგვერდის გახსნა",
  openPanel: "პანელზე გადასვლა",
  freeNote:
    "უფასოა bbloom.ge მისამართზე. საკუთარი დომენი, ონლაინ შეკვეთები და მომხმარებლების ანგარიშები ფასიანია.",
  saveFailed: "ვებგვერდის შენახვა ვერ მოხერხდა. სცადეთ თავიდან.",
  errors: problemStrings("ka"),
};

export function tryStrings(locale: string): TryStrings {
  return locale === "en" ? en : ka;
}
