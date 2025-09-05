// home/shared.js
import supabase from '../config.js'; // Aggiunta importante per usare Supabase

// --- GESTIONE TEMA ---
const themeToggleButton = document.getElementById('theme-toggle');
const docElement = document.documentElement;

const updateButtonIcon = () => {
    if (docElement.classList.contains('dark-mode')) {
        themeToggleButton.textContent = '☀️';
    } else {
        themeToggleButton.textContent = '🌙';
    }
};

themeToggleButton.addEventListener('click', () => {
    docElement.classList.toggle('dark-mode');
    if (docElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
    updateButtonIcon(); // Aggiorniamo l'icona subito dopo il click
});

document.addEventListener('DOMContentLoaded', updateButtonIcon);


// --- GESTIONE LOGOUT (NUOVA SEZIONE) ---
const logoutButton = document.getElementById('logout-btn');

logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Errore durante il logout:', error.message);
    } else {
        window.location.href = '../index.html'; // Reindirizza alla pagina di login
    }
});
