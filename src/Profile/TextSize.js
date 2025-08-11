export function applyTextSize(size) {
  console.log("applyTextSize called with:", size);

  const fontSizeMap = {
    Small: "var(--font-size-small)",
    Medium: "var(--font-size-medium)",
    Large: "var(--font-size-large)",
  };

  const fontSize = fontSizeMap[size] || "16px";
  console.log("Setting font size to:", fontSize);

  // Set the main font size variable
  document.documentElement.style.setProperty('--user-font-size', fontSizeMap[size] || 'var(--font-size-medium)');
  // Force a re-render by triggering a resize event
  window.dispatchEvent(new Event("resize"));
}
