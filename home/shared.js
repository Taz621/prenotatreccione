// home/shared.js

const themeToggleButton = document.getElementById('theme-toggle');
const docElement = document.documentElement;

// Aggiungi l'evento al click del pulsante
themeToggleButton.addEventListener('click', () => {
    // Alterna la classe sul tag <html>
    docElement.classList.toggle('dark-mode');

    // Salva la nuova preferenza in base allo stato attuale
    if (docElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
