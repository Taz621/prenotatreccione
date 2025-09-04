// home/prenota.js
import supabase from '../config.js';

// ... (tutte le variabili e le funzioni del calendario rimangono invariate) ...
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const bookBtn = document.getElementById('book-btn');
const selectionInfo = document.getElementById('selection-info');
let currentDate = new Date();
let startDate = null;
let endDate = null;
let bookings = [];
let currentUser = null;
const fetchBookings = async () => {
    const { data, error } = await supabase.from('bookings').select('user_id, start_date, end_date');
    if (error) { console.error('Error fetching bookings', error); return; }
    bookings = data;
    renderCalendar();
};
const renderCalendar = () => {
    calendarDaysEl.innerHTML = '';
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    monthYearEl.textContent = `${currentDate.toLocaleDateString('it-IT', { month: 'long' })} ${year}`;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const displayFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
    for (let i = 0; i < displayFirstDay; i++) {
        calendarDaysEl.appendChild(document.createElement('div'));
    }
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
        if (dayDate < new Date().setHours(0,0,0,0)) {
            dayEl.style.opacity = '0.5';
            dayEl.style.cursor = 'not-allowed';
            dayEl.removeEventListener('click', () => handleDateClick(dayDate));
        }
        calendarDaysEl.appendChild(dayEl);
    }
    updateSelectionUI();
};
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
const handleDateClick = (date) => {
    if (date < new Date().setHours(0,0,0,0)) return;
    if (!startDate || (startDate && endDate)) {
        startDate = date;
        endDate = null;
    } else if (date < startDate) {
        startDate = date;
    } else {
        endDate = date;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (isDateBooked(d).status) {
                alert('L\'intervallo selezionato contiene giorni già prenotati. Seleziona un altro periodo.');
                startDate = null; endDate = null; break;
            }
        }
    }
    updateSelectionUI();
};
const updateSelectionUI = () => {
    document.querySelectorAll('.day').forEach(dayEl => {
        dayEl.classList.remove('selected', 'in-range', 'range-start', 'range-end');
        if (!dayEl.textContent) return;
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(dayEl.textContent));
        if (startDate && endDate) {
            if (dayDate > startDate && dayDate < endDate) dayEl.classList.add('in-range');
            if (dayDate.getTime() === startDate.getTime()) dayEl.classList.add('selected', 'range-start');
            if (dayDate.getTime() === endDate.getTime()) dayEl.classList.add('selected', 'range-end');
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
prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
bookBtn.addEventListener('click', async () => {
    if (!startDate || !endDate || !currentUser) return;
    const formatForSupabase = (date) => date.toISOString().split('T')[0];
    const { error } = await supabase.from('bookings').insert({
        user_id: currentUser.id, user_email: currentUser.email,
        start_date: formatForSupabase(startDate), end_date: formatForSupabase(endDate)
    });
    if (error) {
        alert('Errore durante la prenotazione: ' + error.message);
        console.error('Booking error:', error);
    } else {
        alert('Prenotazione effettuata con successo!');
        startDate = null; endDate = null; fetchBookings();
    }
});


// Funzione di inizializzazione
const init = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        window.location.href = '../index.html';
        return;
    }
    currentUser = session.user;
    if (currentUser.email === 'admin@admin.it') {
        alert("L'account admin non può effettuare prenotazioni.");
        window.location.href = 'panoramica.html';
        return;
    }
    await fetchBookings();
};

init();
