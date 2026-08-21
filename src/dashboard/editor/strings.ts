import type { Locale } from "../../i18n";

/**
 * Chrome for the page editor. Kept beside the editor rather than in the
 * dashboard dictionary because it is a self-contained screen with a lot of
 * strings of its own.
 */
export type EditorStrings = {
  title: string;
  subtitle: string;
  sections: string;
  selectSection: string;
  noFields: string;
  loading: string;
  loadFailed: string;
  retry: string;
  edited: string;
  hidden: string;
  show: string;
  hide: string;
  moveUp: string;
  moveDown: string;
  save: string;
  saving: string;
  saved: string;
  saveFailed: string;
  unsaved: string;
  reset: string;
  resetConfirm: string;
  publish: string;
  publishing: string;
  publishDone: (count: number) => string;
  discard: string;
  discardConfirm: string;
  unpublished: string;
  allPublished: string;
  preview: string;
  draftView: string;
  liveView: string;
  desktop: string;
  phone: string;
  contentLanguage: string;
  item: (index: number) => string;
  addItem: string;
  removeItem: string;
  upload: string;
  uploading: string;
  replaceImage: string;
  removeImage: string;
  noImage: string;
  uploadFailed: string;
};

const en: EditorStrings = {
  title: "Your page",
  subtitle: "Edit your website and publish when you are happy with it.",
  sections: "Sections",
  selectSection: "Pick a section on the left to edit it.",
  noFields: "This section has nothing to edit.",
  loading: "Loading your page…",
  loadFailed: "We could not load your page.",
  retry: "Try again",
  edited: "Edited",
  hidden: "Hidden",
  show: "Show on the site",
  hide: "Hide from the site",
  moveUp: "Move up",
  moveDown: "Move down",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "We could not save this section.",
  unsaved: "Unsaved changes",
  reset: "Reset to template",
  resetConfirm: "Reset this section to the original template text?",
  publish: "Publish changes",
  publishing: "Publishing…",
  publishDone: (count) =>
    count === 1 ? "1 section is now live." : `${count} sections are now live.`,
  discard: "Discard",
  discardConfirm: "Throw away every unpublished change?",
  unpublished: "You have changes that are not live yet.",
  allPublished: "Everything is published.",
  preview: "Preview",
  draftView: "Your edits",
  liveView: "Live site",
  desktop: "Desktop",
  phone: "Phone",
  contentLanguage: "Editing in",
  item: (index) => `Item ${index}`,
  addItem: "+ Add item",
  removeItem: "Remove item",
  upload: "Upload image",
  uploading: "Uploading…",
  replaceImage: "Replace",
  removeImage: "Remove",
  noImage: "No image",
  uploadFailed: "We could not upload that image.",
};

const ka: EditorStrings = {
  title: "თქვენი გვერდი",
  subtitle: "შეცვალეთ თქვენი საიტი და გამოაქვეყნეთ, როცა მოგეწონებათ.",
  sections: "სექციები",
  selectSection: "აირჩიეთ სექცია მარცხნივ, რომ შეცვალოთ.",
  noFields: "ამ სექციაში შესაცვლელი არაფერია.",
  loading: "იტვირთება…",
  loadFailed: "გვერდის ჩატვირთვა ვერ მოხერხდა.",
  retry: "კიდევ სცადეთ",
  edited: "შეცვლილი",
  hidden: "დამალული",
  show: "საიტზე ჩვენება",
  hide: "საიტზე დამალვა",
  moveUp: "ზემოთ",
  moveDown: "ქვემოთ",
  save: "შენახვა",
  saving: "ინახება…",
  saved: "შენახულია",
  saveFailed: "სექციის შენახვა ვერ მოხერხდა.",
  unsaved: "შეუნახავი ცვლილებები",
  reset: "შაბლონის დაბრუნება",
  resetConfirm: "დავაბრუნოთ ამ სექციის საწყისი ტექსტი?",
  publish: "ცვლილებების გამოქვეყნება",
  publishing: "ქვეყნდება…",
  publishDone: (count) => `${count} სექცია გამოქვეყნდა.`,
  discard: "გაუქმება",
  discardConfirm: "წავშალოთ ყველა გამოუქვეყნებელი ცვლილება?",
  unpublished: "გაქვთ ცვლილებები, რომლებიც ჯერ არ გამოქვეყნებულა.",
  allPublished: "ყველაფერი გამოქვეყნებულია.",
  preview: "წინასწარი ხედი",
  draftView: "თქვენი ცვლილებები",
  liveView: "ცოცხალი საიტი",
  desktop: "კომპიუტერი",
  phone: "ტელეფონი",
  contentLanguage: "რედაქტირება",
  item: (index) => `ელემენტი ${index}`,
  addItem: "+ ელემენტის დამატება",
  removeItem: "ელემენტის წაშლა",
  upload: "სურათის ატვირთვა",
  uploading: "იტვირთება…",
  replaceImage: "შეცვლა",
  removeImage: "წაშლა",
  noImage: "სურათი არ არის",
  uploadFailed: "სურათის ატვირთვა ვერ მოხერხდა.",
};

export function editorStrings(locale: Locale): EditorStrings {
  return locale === "en" ? en : ka;
}
