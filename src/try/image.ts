import type { DraftImage } from "./draft";

/**
 * Photographs straight off a phone are several megabytes each, and the draft
 * lives in localStorage, which gives us about five in total. So an image picked
 * before signup is re-encoded down to something a web page actually needs.
 *
 * This is lossy on purpose and only applies to the anonymous draft: once the
 * client has an account, images go to the media endpoint at full quality like
 * everywhere else in the product.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;
/** Roughly 1.4MB of base64, leaving room for several images plus the text. */
const MAX_DATA_URL = 1_900_000;

export class ImageTooLargeError extends Error {
  constructor() {
    super("image-too-large");
    this.name = "ImageTooLargeError";
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-unreadable"));
    };
    image.src = url;
  });
}

export async function fileToDraftImage(file: File): Promise<DraftImage> {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas-unavailable");
  context.drawImage(image, 0, 0, width, height);

  // PNG screenshots re-encode far smaller as JPEG, and transparency is not
  // something a hero photograph needs.
  let dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  if (dataUrl.length > MAX_DATA_URL) {
    dataUrl = canvas.toDataURL("image/jpeg", 0.6);
  }
  if (dataUrl.length > MAX_DATA_URL) throw new ImageTooLargeError();

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return { dataUrl, name: `${base}.jpg`, type: "image/jpeg" };
}
