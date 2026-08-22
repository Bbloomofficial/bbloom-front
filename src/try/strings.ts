/**
 * Copy for the build-before-you-sign-up flow. Georgian first, English second,
 * kept beside the feature rather than in the marketing dictionary because none
 * of it is marketing: it is the instructions for an editor.
 */

export type TryStrings = {
  galleryTitle: string;
  gallerySubtitle: string;
  galleryHint: string;
  choose: string;
  resume: string;
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

  saveCta: string;
  saveTitle: string;
  saveBody: string;
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
};

const en: TryStrings = {
  galleryTitle: "Pick a design and start building",
  gallerySubtitle:
    "Change every word and every picture right away. No account needed until you want to keep it.",
  galleryHint: "Your website is free on a bbloom.ge address. Pay only for your own domain and features that need a server.",
  choose: "Use this design",
  resume: "Continue where you left off",
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

  saveCta: "Save my website",
  saveTitle: "Create your account to keep it",
  saveBody:
    "Your website goes online straight away, free, at a bbloom.ge address.",
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
};

const ka: TryStrings = {
  galleryTitle: "აირჩიეთ დიზაინი და დაიწყეთ",
  gallerySubtitle:
    "შეცვალეთ ყველა ტექსტი და სურათი მაშინვე. ანგარიში მხოლოდ მაშინ დაგჭირდებათ, როცა შენახვას მოისურვებთ.",
  galleryHint:
    "ვებგვერდი უფასოა bbloom.ge მისამართზე. გადახდა მხოლოდ საკუთარ დომენსა და სერვერზე დამოკიდებულ ფუნქციებზეა საჭირო.",
  choose: "ამ დიზაინით დაწყება",
  resume: "გააგრძელეთ იქიდან, სადაც შეჩერდით",
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

  saveCta: "ვებგვერდის შენახვა",
  saveTitle: "შესანახად შექმენით ანგარიში",
  saveBody:
    "ვებგვერდი მაშინვე გამოქვეყნდება, უფასოდ, bbloom.ge მისამართზე.",
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
};

export function tryStrings(locale: string): TryStrings {
  return locale === "en" ? en : ka;
}
