export function stringToColor({
  input = "unknown",
}: {
  input?: string;
}): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 70 + (Math.abs(hash) % 20);
  const lightness = 80 + (Math.abs(hash) % 10);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
