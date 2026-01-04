import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

interface SanityImageSource {
  asset: { _ref: string; _type: "reference" };
  alt?: string;
}

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export function getImageUrl(
  source: SanityImageSource,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  const { width = 800, height, quality = 80 } = options;
  let img = urlFor(source).width(width).quality(quality).auto("format");
  if (height) img = img.height(height);
  return img.url();
}

export function getSrcSet(
  source: SanityImageSource,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths.map((w) => `${urlFor(source).width(w).auto("format").url()} ${w}w`).join(", ");
}

