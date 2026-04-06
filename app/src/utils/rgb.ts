export interface RGB {
  r: number; // 0–1
  g: number; // 0–1
  b: number; // 0–1
}

export function hexaToRGB(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

// Convert sRGB component (0–1) to linear light (0–1)
export function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Convert linear light component (0–1) back to sRGB (0–1)
export function linearToSrgb(v: number): number {
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

// Linear interpolation
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Interpolate colors in **linear RGB space**
export function mixLinearRGB(c1: RGB, c2: RGB, t: number): RGB {
  const r = linearToSrgb(lerp(srgbToLinear(c1.r), srgbToLinear(c2.r), t));
  const g = linearToSrgb(lerp(srgbToLinear(c1.g), srgbToLinear(c2.g), t));
  const b = linearToSrgb(lerp(srgbToLinear(c1.b), srgbToLinear(c2.b), t));

  return { r, g, b };
}
