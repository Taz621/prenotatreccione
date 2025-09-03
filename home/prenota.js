// home/prenota.js
import supabase from '../config.js';

const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const bookBtn = document.getElementById('book-btn');
const selectionInfo = document.getElementById('selection-info');
const logoutButton = document.querySelector('.logout-btn');

let currentDate = new Date();
let startDate = null;
let endDate = null;
let bookings = [];
let currentUser = null;

// Funzione per caricare le prenotazioni esistenti
const fetchBookings = async () => {
    const { data, error } = await supabase.from('bookings').select('user_id, start_date, end_date');
    if (error) {
        console.error('Error fetching bookings', error);
        return;
    }
    bookings = data;
    renderCalendar();
};

// Funzione per generare il calendario
const renderCalendar = () => {
    calendarDaysEl.innerHTML = '';
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    monthYearEl.textContent = `${currentDate.toLocaleDateString('it-IT', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Gestione del primo giorno (Lunedì = 0)
    const displayFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    // Aggiungi spazi per i giorni del mese precedente
    for (let i = 0; i < displayFirstDay; i++) {
        const emptyDiv = document.createElement('div');
        calendarDaysEl.appendChild(emptyDiv);
    }

    // Aggiungi i giorni del mese corrente
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.textContent = i;
        const dayDate = new Date(year, month, i);

        const isBooked = isDateBooked(dayDate);
        if (isBooked.status) {
            dayEl.classList.add(isBooked.isOwner ? 'booked-user' : 'booked-other');
        } else {
            dayEl.addEventListener('click', () => handleDateClick(dayDate));
        }
        
        // Evidenzia i giorni passati
        if (dayDate < new Date().setHours(0,0,0,0)) {
            dayEl.style.opacity = '0.5';
            dayEl.style.cursor = 'not-allowed';
            dayEl.removeEventListener('click', () => handleDateClick(dayDate));
        }

        calendarDaysEl.appendChild(dayEl);
    }
    updateSelectionUI();
};

// Funzione per verificare se una data è prenotata
const isDateBooked = (date) => {
    for (const booking of bookings) {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        if (date >= start && date <= end) {
            return { status: true, isOwner: booking.user_id === currentUser.id };
        }
    }
    return { status: false, isOwner: false };
};

// Gestione del click sulla data
const handleDateClick = (date) => {
    if (date < new Date().setHours(0,0,0,0)) return; // Non selezionare date passate

    if (!startDate || (startDate && endDate)) {
        startDate = date;
        endDate = null;
    } else if (date < startDate) {
        startDate = date;
    } else {
        endDate = date;
        // Verifica che l'intervallo non contenga giorni già prenotati
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (isDateBooked(d).status) {
                alert('L\'intervallo selezionato contiene giorni già prenotati. Seleziona un altro periodo.');
                startDate = null;
                endDate = null;
                break;
            }
        }
    }
    updateSelectionUI();
};

// Aggiorna l'UI del calendario e del bottone
const updateSelectionUI = () => {
    document.querySelectorAll('.day').forEach(dayEl => {
        dayEl.classList.remove('selected', 'in-range', 'range-start', 'range-end');
        if (!dayEl.textContent) return;

        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayEl.textContent));

        if (startDate && endDate) {
            if (dayDate > startDate && dayDate < endDate) {
                dayEl.classList.add('in-range');
            }
            if (dayDate.getTime() === startDate.getTime()) {
                dayEl.classList.add('selected', 'range-start');
            }
            if (dayDate.getTime() === endDate.getTime()) {
                dayEl.classList.add('selected', 'range-end');
            }
        } else if (startDate && dayDate.getTime() === startDate.getTime()) {
            dayEl.classList.add('selected');
        }
    });

    if (startDate && endDate) {
        bookBtn.disabled = false;
        bookBtn.textContent = 'Conferma Prenotazione';
        selectionInfo.textContent = `Dal ${startDate.toLocaleDateString('it-IT')} al ${endDate.toLocaleDateString('it-IT')}`;
    } else {
        bookBtn.disabled = true;
        bookBtn.textContent = 'Seleziona un intervallo';
        selectionInfo.textContent = startDate ? `Giorno di arrivo: ${startDate.toLocaleDateString('it-IT')}` : '';
    }
};

// Navigazione tra i mesi
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Gestione click sul bottone "Prenota"
bookBtn.addEventListener('click', async () => {
    if (!startDate || !endDate || !currentUser) return;

    // Formattazione data per Supabase (YYYY-MM-DD)
    const formatForSupabase = (date) => date.toISOString().split('T')[0];

    const { error } = await supabase.from('bookings').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        start_date: formatForSupabase(startDate),
        end_date: formatForSupabase(endDate)
    });

    if (error) {
        alert('Errore durante la prenotazione: ' + error.message);
        console.error('Booking error:', error);
    } else {
        alert('Prenotazione effettuata con successo!');
        startDate = null;
        endDate = null;
        fetchBookings(); // Ricarica prenotazioni e calendario
    }
});

// Gestione Logout
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
});

// Funzione di inizializzazione
const init = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        window.location.href = '../index.html';
        return;
    }
    
    currentUser = session.user;

    // Se l'utente è l'admin, non dovrebbe essere qui
    if (currentUser.email === 'admin@admin.it') {
        alert("L'account admin non può effettuare prenotazioni.");
        window.location.href = 'panoramica.html';
        return;
    }

    await fetchBookings();
};

init();