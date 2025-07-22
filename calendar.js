window.onload = generateCalendar(new Date());

let offset = 0; // Offset for the calendar, can be used to navigate through days

function generateCalendar(startDate) {
    const calendarDays = document.getElementById('calendarDays');
    const calendarWeeks = document.getElementById('calendarWeeks');
    const calendarMonths = document.getElementById('calendarMonths');

    const Weekdays = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
    const days = [];
    const today = new Date();

    const dayRow = document.getElementById('calendarDays');
    const weekRow = document.getElementById('calendarWeeks');

    for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dayCell = dayRow.insertCell();
    const weekCell = weekRow.insertCell();

    // Style day
    if (date.toDateString() === today.toDateString()) {
        dayCell.innerHTML = `<div><div>${date.getDate()}</div><div>Dziś</div></div>`;
        dayCell.style.border = '2px solid #dddada';
    } else {
        dayCell.textContent = date.getDate();
    }

    // Style week
    weekCell.textContent = Weekdays[date.getDay()];
    if (date.getDay() === 0 || date.getDay() === 6) {
        weekCell.style.color = '#be3d3d'; // Weekend styling
    }
    }

    const monthRow = document.getElementById('calendarMonths');
    monthRow.innerHTML = '';

    const monthSpans = [];

    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const month = date.toLocaleString('pl', { month: 'long' });

        if (monthSpans.length === 0 || monthSpans[monthSpans.length - 1].name !== month) {
            monthSpans.push({ name: month, span: 1 });
        } else {
            monthSpans[monthSpans.length - 1].span++;
        }
    }

    // Render month cells
    monthSpans.forEach((m) => {
        const cell = monthRow.insertCell();
        cell.textContent = m.name;
        cell.colSpan = m.span;
    });

    const yearRow = document.getElementById('calendarYear');
    yearRow.innerHTML = '';

    let currentYear = startDate.getFullYear();
    let spanY = 0;

    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const year = date.getFullYear();

        if (year === currentYear) {
            spanY++;
        }

        const isLast = i === 13;
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i + 1);
        const nextYear = !isLast && nextDate.getFullYear() !== currentYear;

        if (nextYear || isLast) {
            const cell = yearRow.insertCell();
            cell.textContent = currentYear;
            cell.colSpan = spanY;

            // reset
            currentYear = nextDate.getFullYear();
            spanY = 0;
        }
    }
}

function updateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarWeeks = document.getElementById('calendarWeeks');
    const calendarMonths = document.getElementById('calendarMonths');

    // Clear existing content
    calendarDays.innerHTML = '';
    calendarWeeks.innerHTML = '';
    calendarMonths.innerHTML = '';

    // Calculate new start date based on offset
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + offset);

    // Rebuild the calendar with the new start date
    generateCalendar(startDate);
}

// Add event listeners for navigation buttons
document.getElementById('calendarBack').addEventListener('click', function () {
    offset -= 7; // Go back 21 days
    updateCalendar();
});
document.getElementById('calendarForward').addEventListener('click', function () {
    offset += 7; // Go forward 21 days
    updateCalendar();
});
