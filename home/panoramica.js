// home/panoramica.js
import supabase from '../config.js';

const bookingsList = document.getElementById('bookings-list');
const logoutButton = document.querySelector('.logout-btn');

let currentUser = null;
let isAdmin = false;

// Funzione per formattare le date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
};

// Funzione per caricare le prenotazioni
const fetchBookings = async () => {
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error.message);
        bookingsList.innerHTML = '<p class="error">Impossibile caricare le prenotazioni.</p>';
        return;
    }

    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>Nessuna prenotazione ancora effettuata. Sii il primo!</p>';
        return;
    }

    bookingsList.innerHTML = ''; // Pulisci la lista

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'booking-card';

        const canDelete = isAdmin || (currentUser && currentUser.id === booking.user_id);

        card.innerHTML = `
            <div>
                <p><strong>Dal ${formatDate(booking.start_date)} al ${formatDate(booking.end_date)}</strong></p>
                <p class="user-email">Prenotato da: ${booking.user_email}</p>
            </div>
            ${canDelete ? `<button class="delete-btn" data-id="${booking.id}">Elimina</button>` : ''}
        `;
        bookingsList.appendChild(card);
    });

    // Aggiungi event listener per i bottoni di eliminazione
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const bookingId = event.target.dataset.id;
            const confirmed = confirm('Sei sicuro di voler eliminare questa prenotazione?');

            if (confirmed) {
                await deleteBooking(bookingId);
            }
        });
    });
};

// Funzione per eliminare una prenotazione
const deleteBooking = async (id) => {
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Errore: Non hai i permessi per eliminare questa prenotazione o si è verificato un problema.');
        console.error('Delete error:', error.message);
    } else {
        alert('Prenotazione eliminata con successo!');
        fetchBookings(); // Ricarica la lista
    }
};

// Gestione Logout
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
});

// Funzione di inizializzazione
const init = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        console.error('No session found, redirecting to login.');
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = session.user;
    isAdmin = currentUser.email === 'admin@admin.it';

    // Nascondi il link "Prenota" per l'admin
    if (isAdmin) {
        const prenotaLink = document.querySelector('a[href="prenota.html"]');
        if (prenotaLink) {
            prenotaLink.style.display = 'none';
        }
    }
    
    await fetchBookings();
};

init();