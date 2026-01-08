function limitWordsResponsively() {
  const element = document.querySelector('.consoledes');
  if (!element) return;

  const maxWords = 10; // Set your word limit
  const originalText = element.dataset.fullText || element.textContent.trim();
  element.dataset.fullText = originalText; // Store original text

  if (window.innerWidth <= 480) {
    // Trim to maxWords if screen is small
    const words = originalText.split(/\s+/);
    if (words.length > maxWords) {
      element.textContent = words.slice(0, maxWords).join(' ') + '...';
    }
    // Apply CSS-like truncation (optional)
    element.style.whiteSpace = 'nowrap';
    element.style.overflow = 'hidden';
    element.style.textOverflow = 'ellipsis';
  } else {
    // Restore original text & reset styles
    element.textContent = originalText;
    element.style.whiteSpace = '';
    element.style.overflow = '';
    element.style.textOverflow = '';
  }
}

// Initialize and update on resize
window.addEventListener('load', limitWordsResponsively);
window.addEventListener('resize', limitWordsResponsively);