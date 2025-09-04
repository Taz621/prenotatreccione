// home/shared.js

const themeToggleButton = document.getElementById('theme-toggle');
const docElement = document.documentElement; // Usiamo l'elemento <html>

// Funzione per aggiornare l'icona del pulsante al caricamento
const updateButtonIcon = () => {
    if (docElement.classList.contains('dark-mode')) {
        themeToggleButton.textContent = '☀️';
    } else {
        themeToggleButton.textContent = '🌙';
    }
};

// Aggiungi l'evento al click del pulsante
themeToggleButton.addEventListener('click', () => {
    // Alterna la classe dark-mode
    docElement.classList.toggle('dark-mode');

    // Salva la nuova preferenza e aggiorna l'icona
    if (docElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggleButton.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleButton.textContent = '🌙';
    }
});

// Aggiorna l'icona non appena il DOM è pronto
document.addEventListener('DOMContentLoaded', updateButtonIcon);
