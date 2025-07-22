async function getCredentials() {
  const apiKey = prompt('Please enter your API key:');
  const clientId = prompt('Please enter your Client ID:');
  
  if (!apiKey || !clientId) {
    alert('Both API key and Client ID are required!');
    return null;
  }
  
  return { apiKey, clientId };
}

function loadGoogleAPI() {
    return new Promise((resolve) => {
        if (window.gapi) {
            resolve(window.gapi);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('auth2', () => resolve(window.gapi));
        };
        document.head.appendChild(script);
    });
}

async function fetchCalendarEvents(startDate, apiKey, accessToken) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);
    
    const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `key=${apiKey}&` +
        `timeMin=${startDate.toISOString()}&` +
        `timeMax=${endDate.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `access_token=${accessToken}`
    );
    
    return response.ok ? (await response.json()).items || [] : [];
}

window.onload = generateCalendar(new Date());

let offset = 0;

async function generateCalendar(startDate) {
    const credentials = await getCredentials();
    API_KEY = credentials.apiKey;
    CLIENT_ID = credentials.clientId;
    
    const gapi = await loadGoogleAPI();
    await gapi.auth2.init({ client_id: CLIENT_ID });
    const authInstance = gapi.auth2.getAuthInstance();
    
    if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn({ scope: 'https://www.googleapis.com/auth/calendar.readonly' });
    }
    
    const events = await fetchCalendarEvents(startDate, API_KEY, authInstance.currentUser.get().getAuthResponse().access_token);
    
    const Weekdays = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
    const today = new Date();
    const dayRow = document.getElementById('calendarDays');
    const weekRow = document.getElementById('calendarWeeks');
    
    for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayCell = dayRow.insertCell();
        const weekCell = weekRow.insertCell();
        
        const dayEvents = events.filter(event => {
            if (!event.start) return false;
            const eventDate = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
            return eventDate.toDateString() === date.toDateString();
        });

        let dayContent = '';
        if (date.toDateString() === today.toDateString()) {
            dayContent = `<div><div>${date.getDate()}</div><div>Dziś</div></div>`;
            dayCell.style.border = '2px solid #dddada';
        } else {
            dayContent = `<div>${date.getDate()}</div>`;
        }
        
        dayEvents.forEach(event => {
            const time = event.start.dateTime ? 
                new Date(event.start.dateTime).toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit', hour12: false }) : 
                '';
            dayContent += `<div style="font-size:10px;color:#666;">${time} ${event.summary || ''}</div>`;
        });
        
        dayCell.innerHTML = dayContent;
        weekCell.textContent = Weekdays[date.getDay()];
        
        if (date.getDay() === 0 || date.getDay() === 6) {
            weekCell.style.color = '#be3d3d';
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
            currentYear = nextDate.getFullYear();
            spanY = 0;
        }
    }
}

function updateCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarWeeks = document.getElementById('calendarWeeks');
    const calendarMonths = document.getElementById('calendarMonths');

    calendarDays.innerHTML = '';
    calendarWeeks.innerHTML = '';
    calendarMonths.innerHTML = '';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + offset);

    generateCalendar(startDate);
}

document.getElementById('calendarBack').addEventListener('click', function () {
    offset -= 7;
    updateCalendar();
});
document.getElementById('calendarForward').addEventListener('click', function () {
    offset += 7;
    updateCalendar();
});
