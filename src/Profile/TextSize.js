export function applyTextSize(size) {
  const fontSizeMap = {
    Small: '14px',
    Medium: '16px',
    Large: '18px',
  };

  const fontSize = fontSizeMap[size] || '16px';
  document.documentElement.style.setProperty('--user-font-size', fontSize);
}
