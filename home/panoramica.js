// home/panoramica.js
import supabase from '../config.js';

const bookingsList = document.getElementById('bookings-list');
let currentUser = null;
let isAdmin = false;

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Aggiungiamo 'T00:00:00' per evitare che il fuso orario cambi il giorno durante la formattazione
    return new Date(dateString + 'T00:00:00').toLocaleDateString('it-IT', options);
};

const fetchBookings = async () => {
    // --- QUESTA È LA PARTE MODIFICATA ---
    // Creiamo la data di oggi in formato YYYY-MM-DD per il filtro
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // Aggiungiamo il filtro .gte('end_date', todayString) alla richiesta
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('end_date', todayString) // Filtra le prenotazioni la cui data di fine è oggi o futura
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error.message);
        bookingsList.innerHTML = '<p class="error">Impossibile caricare le prenotazioni.</p>';
        return;
    }
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>Nessuna prenotazione futura in programma.</p>';
        return;
    }
    bookingsList.innerHTML = '';
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
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const bookingId = event.target.dataset.id;
            if (confirm('Sei sicuro di voler eliminare questa prenotazione?')) {
                await deleteBooking(bookingId);
            }
        });
    });
};

const deleteBooking = async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
        alert('Errore: Non hai i permessi per eliminare questa prenotazione o si è verificato un problema.');
        console.error('Delete error:', error.message);
    } else {
        alert('Prenotazione eliminata con successo!');
        fetchBookings();
    }
};

const init = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        console.error('No session found, redirecting to login.');
        window.location.href = '../index.html';
        return;
    }
    currentUser = session.user;
    isAdmin = currentUser.email === 'admin@admin.it';
    if (isAdmin) {
        const prenotaLink = document.querySelector('a[href="prenota.html"]');
        if (prenotaLink) {
            prenotaLink.style.display = 'none';
        }
    }
    await fetchBookings();
};

init();
