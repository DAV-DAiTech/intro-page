import type { ImageMetadata } from 'astro';

const images = import.meta.glob<ImageMetadata>('../assets/club/*.webp', {
  eager: true,
  import: 'default'
});

export function clubImage(file: string): ImageMetadata {
  const image = images[`../assets/club/${file}`];
  if (!image) throw new Error(`Missing club image: ${file}`);
  return image;
}
