export const getFontSize = (initials: string, diameter: number): number => {
  // Adjust these numbers as needed for your design
  const base = 0.6; // fraction of diameter for 2 letters
  const min = 10; // px
  const max = diameter * base;
  // Shrink font size as initials grow
  return Math.max(min, max - (initials.length - 2) * 6);
};

export const getInitials = (name?: string): string => {
  if (!name?.trim()) return "?";

  const words = name.trim().split(/\s+/);
  const initials =
    words.length === 1
      ? words[0].slice(0, 1).toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();

  return initials;
};

export const stringToHexColor = (string: string): string => {
  // 1. Bitwise manipulation to create a hash
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 2. Convert hash to a hex color code
  const hexColor = `#${((1 << 24) + (hash & 0xffffff)).toString(16).slice(1)}`;
  return hexColor;
};

export const getContrastTextColor = (hex: string): string => {
  // Remove hash if present
  hex = hex.replace(/^#/, "");

  // Parse r, g, b
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? "#222" : "#fff";
};
