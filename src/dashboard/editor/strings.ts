import type { ProblemStrings } from "../../api/problem";
import { problemStrings } from "../../api/problemStrings";
import type { Locale } from "../../i18n";

/**
 * Chrome for the page editor. Kept beside the editor rather than in the
 * dashboard dictionary because it is a self-contained screen with a lot of
 * strings of its own.
 */
export type EditorStrings = {
  title: string;
  subtitle: string;
  backToDashboard: string;
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
  cancel: string;
  modeEdit: string;
  modeReview: string;
  editModeHint: string;
  editModeLiveHint: string;
  hotspotText: string;
  hotspotImage: string;
  imageTitle: string;
  imageFromFile: string;
  imageFromLink: string;
  imageLinkPlaceholder: string;
  imageLinkUse: string;
  imageLinkFailed: string;
  imagePending: string;
  /**
   * The business address and map link. Site-level rather than section-level, so
   * these have their own panel and their own save.
   */
  locationTitle: string;
  locationHint: string;
  locationAddress: string;
  locationMapUrl: string;
  locationMapHint: string;
  locationSaveFailed: string;
  /** What the client is told when a save is refused. */
  errors: ProblemStrings;
};

const en: EditorStrings = {
  title: "Your page",
  subtitle: "Edit your website and publish when you are happy with it.",
  backToDashboard: "Back to the dashboard",
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
  cancel: "Cancel",
  modeEdit: "Edit",
  modeReview: "Review",
  editModeHint:
    "Click anything marked on the preview to jump to the field that changes it.",
  editModeLiveHint:
    "Switch the preview to your draft to click text and images on the page.",
  hotspotText: "Click to edit this text",
  hotspotImage: "Click to change this image",
  imageTitle: "Change image",
  imageFromFile: "Choose a file",
  imageFromLink: "Or paste an image link",
  imageLinkPlaceholder: "https://…",
  imageLinkUse: "Use this link",
  imageLinkFailed:
    "That link could not be fetched. Download the image and upload the file instead.",
  imagePending: "Not uploaded yet — it is saved when you press Save.",
  locationTitle: "Where you are",
  locationHint:
    "Shown on your website with a map, so visitors can find you. This is saved for the whole site and goes live straight away — it does not wait for Publish.",
  locationAddress: "Address",
  locationMapUrl: "Map link",
  locationMapHint:
    "Optional. Paste a Google Maps link to your location — without one we find you by the address above.",
  locationSaveFailed: "We could not save your address.",
  errors: problemStrings("en"),
};

const ka: EditorStrings = {
  title: "თქვენი გვერდი",
  subtitle: "შეცვალეთ თქვენი საიტი და გამოაქვეყნეთ, როცა მოგეწონებათ.",
  backToDashboard: "პანელში დაბრუნება",
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
  cancel: "გაუქმება",
  modeEdit: "რედაქტირება",
  modeReview: "დათვალიერება",
  editModeHint:
    "დააჭირეთ პრევიუზე მონიშნულ ნებისმიერ ელემენტს და გადახვალთ შესაბამის ველზე.",
  editModeLiveHint:
    "ტექსტსა და სურათებზე დასაჭერად პრევიუ გადართეთ თქვენს ვერსიაზე.",
  hotspotText: "დააჭირეთ ტექსტის შესაცვლელად",
  hotspotImage: "დააჭირეთ სურათის შესაცვლელად",
  imageTitle: "სურათის შეცვლა",
  imageFromFile: "აირჩიეთ ფაილი",
  imageFromLink: "ან ჩასვით სურათის ბმული",
  imageLinkPlaceholder: "https://…",
  imageLinkUse: "ბმულის გამოყენება",
  imageLinkFailed:
    "ბმულის ჩამოტვირთვა ვერ მოხერხდა. ჩამოტვირთეთ სურათი და ატვირთეთ ფაილად.",
  imagePending: "ჯერ არ არის ატვირთული — შეინახება „შენახვაზე“ დაჭერისას.",
  locationTitle: "სად ხართ",
  locationHint:
    "ჩანს თქვენს ვებგვერდზე რუკასთან ერთად, რომ ვიზიტორებმა გიპოვონ. ინახება მთელი საიტისთვის და მაშინვე ქვეყნდება — „გამოქვეყნებას“ არ ელოდება.",
  locationAddress: "მისამართი",
  locationMapUrl: "რუკის ბმული",
  locationMapHint:
    "სურვილისამებრ. ჩასვით Google Maps-ის ბმული თქვენს მდებარეობაზე — მის გარეშე ზემოთ მითითებული მისამართით გიპოვით.",
  locationSaveFailed: "მისამართის შენახვა ვერ მოხერხდა.",
  errors: problemStrings("ka"),
};

export function editorStrings(locale: Locale): EditorStrings {
  return locale === "en" ? en : ka;
}
