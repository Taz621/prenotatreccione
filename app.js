// app.js
import supabase from './config.js';

// Viste e Form
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Link per cambiare vista
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// Messaggi di errore
const errorMessage = document.getElementById('error-message');

// Controlla se l'utente è già loggato
const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'home/panoramica.html';
    }
};

// Esegui il controllo all'avvio
checkUser();

// --- LOGICA PER CAMBIARE VISTA ---
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.remove('active');
    signupView.classList.add('active');
    errorMessage.textContent = ''; // Pulisci errori
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.classList.remove('active');
    loginView.classList.add('active');
    errorMessage.textContent = ''; // Pulisci errori
});

// --- GESTIONE FORM ---

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
        errorMessage.textContent = 'Errore. L\'email potrebbe essere già in uso o la password è troppo corta.';
        console.error('Signup Error:', error.message);
    } else {
        alert('Registrazione completata! Controlla la tua email per confermare l\'account e poter accedere.');
        // Riporta l'utente alla vista di login
        signupView.classList.remove('active');
        loginView.classList.add('active');
    }
});
