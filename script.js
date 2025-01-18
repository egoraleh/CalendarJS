const calendarGrid = document.getElementById('calendarGrid');
const monthYear = document.getElementById('monthYear');
const modal = document.getElementById('modal');
const modalInput = document.getElementById('modalInput');
const modalSave = document.getElementById('modalSave');
const modalClose = document.getElementById('modalClose');
const notesContainer = document.getElementById('notes');
const addNoteButton = document.getElementById('addNote');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

function loadCalendar(month, year) {
    calendarGrid.innerHTML = '';
    monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day');

        if (selectedDate && day === selectedDate.day && month === selectedDate.month && year === selectedDate.year) {
            dayElement.classList.add('selected');
        }

        dayElement.addEventListener('click', () => selectDate(day, month, year));
        calendarGrid.appendChild(dayElement);
    }

    if (selectedDate && month === selectedDate.month && year === selectedDate.year) {
        showNotes(selectedDate.day, selectedDate.month, selectedDate.year);
        addNoteButton.style.display = 'block';
    } else {
        notesContainer.innerHTML = '';
        addNoteButton.style.display = 'none';
    }
}

function selectDate(day, month, year) {
    selectedDate = { day, month, year, key: `${year}-${month + 1}-${day}` };

    document.querySelectorAll('.day').forEach(el => el.classList.remove('selected'));
    event.target.classList.add('selected');
    showNotes(day, month, year);

    addNoteButton.style.display = 'block';
}

function showNotes(day, month, year) {
    const tasks = JSON.parse(localStorage.getItem(selectedDate.key)) || [];
    notesContainer.innerHTML = '';

    const dateHeader = document.createElement('h3');
    dateHeader.textContent = `Дата: ${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
    dateHeader.classList.add('date-header');
    notesContainer.appendChild(dateHeader);

    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.textContent = task;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-del';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => deleteTask(index));
        taskElement.appendChild(deleteBtn);
        notesContainer.appendChild(taskElement);
    });
}

function deleteTask(index) {
    let tasks = JSON.parse(localStorage.getItem(selectedDate.key)) || [];
    tasks.splice(index, 1);
    localStorage.setItem(selectedDate.key, JSON.stringify(tasks));
    showNotes(selectedDate.day, selectedDate.month, selectedDate.year);
}

function openModal() {
    modal.classList.add('open');
}

function closeModal() {
    modal.classList.remove('open');
}

function saveTask() {
    const task = modalInput.value;
    if (task) {
        let tasks = JSON.parse(localStorage.getItem(selectedDate.key)) || [];
        tasks.push(task);
        localStorage.setItem(selectedDate.key, JSON.stringify(tasks));
        modalInput.value = '';
        closeModal();
        showNotes(selectedDate.day, selectedDate.month, selectedDate.year);
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    loadCalendar(currentMonth, currentYear);
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    loadCalendar(currentMonth, currentYear);
});

addNoteButton.addEventListener('click', openModal);
modalSave.addEventListener('click', saveTask);
modalClose.addEventListener('click', () => {
    closeModal();
    modalInput.value = '';
});

selectedDate = { day: currentDate.getDate(), month: currentMonth, year: currentYear, key: `${currentYear}-${currentMonth + 1}-${currentDate.getDate()}` };
loadCalendar(currentMonth, currentYear);
