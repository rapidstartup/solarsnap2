import { GeoTiff } from '../types/solar';

export function renderRGB(rgb: GeoTiff, mask?: GeoTiff): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = mask ? mask.width : rgb.width;
  canvas.height = mask ? mask.height : rgb.height;

  const dw = rgb.width / canvas.width;
  const dh = rgb.height / canvas.height;

  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const rgbIdx = Math.floor(y * dh) * rgb.width + Math.floor(x * dw);
      const maskIdx = y * canvas.width + x;
      const imgIdx = (y * canvas.width + x) * 4;

      img.data[imgIdx + 0] = Math.min(255, Math.max(0, rgb.rasters[0][rgbIdx]));
      img.data[imgIdx + 1] = Math.min(255, Math.max(0, rgb.rasters[1][rgbIdx]));
      img.data[imgIdx + 2] = Math.min(255, Math.max(0, rgb.rasters[2][rgbIdx]));
      img.data[imgIdx + 3] = mask ? Math.min(255, Math.max(0, mask.rasters[0][maskIdx] * 255)) : 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function renderPalette({
  data,
  mask,
  colors = ['000000', 'ffffff'],
  min = 0,
  max = 1,
  index = 0
}: {
  data: GeoTiff;
  mask?: GeoTiff;
  colors?: string[];
  min?: number;
  max?: number;
  index?: number;
}): HTMLCanvasElement {
  const palette = createPalette(colors);
  const indices = data.rasters[index]
    .map((x) => normalize(x, max, min))
    .map((x) => Math.round(x * (palette.length - 1)));

  return renderRGB(
    {
      ...data,
      rasters: [
        indices.map((i) => palette[i].r),
        indices.map((i) => palette[i].g),
        indices.map((i) => palette[i].b),
      ],
    },
    mask
  );
}

export function createPalette(hexColors: string[]): Array<{r: number; g: number; b: number}> {
  const rgb = hexColors.map(colorToRGB);
  const size = 256;
  const step = (rgb.length - 1) / (size - 1);
  
  return Array(size)
    .fill(0)
    .map((_, i) => {
      const index = i * step;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      return {
        r: lerp(rgb[lower].r, rgb[upper].r, index - lower),
        g: lerp(rgb[lower].g, rgb[upper].g, index - lower),
        b: lerp(rgb[lower].b, rgb[upper].b, index - lower),
      };
    });
}

export function colorToRGB(color: string): {r: number; g: number; b: number} {
  const hex = color.startsWith('#') ? color.slice(1) : color;
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

export function normalize(x: number, max: number = 1, min: number = 0): number {
  return Math.min(Math.max((x - min) / (max - min), 0), 1);
}

export function lerp(x: number, y: number, t: number): number {
  return x + t * (y - x);
}

export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

export function rgbToColor({ r, g, b }: { r: number; g: number; b: number }): string {
  const f = (x: number) => {
    const hex = Math.round(x).toString(16);
    return hex.length == 1 ? `0${hex}` : hex;
  };
  return `#${f(r)}${f(g)}${f(b)}`;
}