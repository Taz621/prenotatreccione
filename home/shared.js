// home/shared.js
import supabase from '../config.js';

// --- GESTIONE TEMA ---
const themeToggleButton = document.getElementById('theme-toggle');
const docElement = document.documentElement;

const updateButtonIcon = () => {
    // Questa funzione non è più necessaria perché il CSS gestisce tutto,
    // ma la lasciamo nel caso servisse per future logiche.
    // L'icona viene già mostrata correttamente dal CSS.
};

themeToggleButton.addEventListener('click', () => {
    docElement.classList.toggle('dark-mode');
    if (docElement.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Eseguiamo un controllo iniziale solo per sicurezza
document.addEventListener('DOMContentLoaded', updateButtonIcon);


// --- GESTIONE LOGOUT (CON LOGICA MIGLIORATA) ---
const logoutButton = document.getElementById('logout-btn');

logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    // Anche se c'è un errore, procediamo con il reindirizzamento
    // per non lasciare l'utente bloccato.
    if (error) {
        console.error('Errore durante il logout:', error.message);
        // Possiamo mostrare un messaggio, ma non blocca l'uscita
    }
    
// Reindirizza sempre e comunque alla pagina di accesso
    window.location.href = '../index.html';
});

// --- GESTIONE ANALYTICS ---
const analyticsBtn = document.getElementById('analytics-btn');
const analyticsDropdown = document.getElementById('analytics-dropdown');
const totalLoginsSpan = document.getElementById('total-logins');
const totalBookingsSpan = document.getElementById('total-bookings');

if (analyticsBtn && analyticsDropdown) {
    analyticsBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isHidden = analyticsDropdown.classList.contains('hidden');
        
        if (isHidden) {
            // Mostra il dropdown
            analyticsDropdown.classList.remove('hidden');
            
            // 1. Leggi accessi totali
            const logins = localStorage.getItem('total_logins') || '0';
            totalLoginsSpan.textContent = logins;
            
            // 2. Fetch prenotazioni totali
            totalBookingsSpan.textContent = '...';
            try {
                const { count, error } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true });
                
                if (error) throw error;
                totalBookingsSpan.textContent = count !== null ? count : '0';
            } catch (err) {
                console.error('Errore nel caricamento delle prenotazioni:', err.message);
                totalBookingsSpan.textContent = 'Errore';
            }
        } else {
            // Nascondi
            analyticsDropdown.classList.add('hidden');
        }
    });

    // Chiudi il menu se si clicca fuori
    document.addEventListener('click', (e) => {
        if (!analyticsBtn.contains(e.target) && !analyticsDropdown.contains(e.target)) {
            analyticsDropdown.classList.add('hidden');
        }
    });
}

