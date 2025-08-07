export function applyTextSize(size) {
  console.log("applyTextSize called with:", size);
  
  const fontSizeMap = {
    Small: '14px',
    Medium: '16px',
    Large: '18px',
  };

  const fontSize = fontSizeMap[size] || '16px';
  console.log("Setting font size to:", fontSize);
  
  // Set the main font size variable
  document.documentElement.style.setProperty('--user-font-size', fontSize);
  
  // Set additional variables for different text sizes
  const baseSize = parseInt(fontSize);
  document.documentElement.style.setProperty('--text-small', `${baseSize - 2}px`);
  document.documentElement.style.setProperty('--text-medium', `${baseSize}px`);
  document.documentElement.style.setProperty('--text-large', `${baseSize + 2}px`);
  
  // Force a re-render by triggering a resize event
  window.dispatchEvent(new Event('resize'));
}
