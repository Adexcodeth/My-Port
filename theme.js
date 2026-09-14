const themeToggle = document.querySelector('[data-theme-toggle]');
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';

function updateTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
}

updateTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portfolio-theme', nextTheme);
    updateTheme(nextTheme);
    });
}