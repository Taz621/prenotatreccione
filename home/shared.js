// home/shared.js

// Seleziona gli elementi necessari
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Funzione per applicare il tema in base a localStorage
const applyTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleButton.textContent = '☀️'; // Cambia in icona sole
    } else {
        body.classList.remove('dark-mode');
        themeToggleButton.textContent = '🌙'; // Cambia in icona luna
    }
};

// Aggiungi l'evento al click del pulsante
themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // Salva la preferenza e aggiorna l'icona
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggleButton.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleButton.textContent = '🌙';
    }
});

// Applica il tema al caricamento della pagina
document.addEventListener('DOMContentLoaded', applyTheme);
