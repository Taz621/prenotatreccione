// app.js
import supabase from './config.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

// Controlla se l'utente è già loggato
const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'home/panoramica.html'; // Reindirizza se già loggato
    }
};

// Esegui il controllo all'avvio
checkUser();

// Gestione Login
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMessage.textContent = 'Credenziali non valide. Riprova.';
        console.error('Login Error:', error.message);
    } else {
        window.location.href = 'home/panoramica.html';
    }
});

// Gestione Registrazione
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        errorMessage.textContent = 'Errore durante la registrazione. L\'email potrebbe essere già in uso.';
        console.error('Signup Error:', error.message);
    } else {
        alert('Registrazione completata! Controlla la tua email per confermare l\'account.');
        // Potresti voler reindirizzare o mostrare un messaggio di successo
    }
});