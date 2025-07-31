// TODO: fn to get initials

const stringToHexColor = (string: string): string => {
  // 1. Bitwise manipulation to create a hash
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 2. Convert hash to a hex color code
  const hexColor = `#${((1 << 24) + (hash & 0xffffff)).toString(16).slice(1)}`;
  return hexColor;
};
