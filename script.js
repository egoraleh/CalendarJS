class CalendarModel {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
    }

    async getTasks(dateKey) {
        const tasks = localStorage.getItem(dateKey);
        return JSON.parse(tasks) || [];
    }

    async saveTask(dateKey, task) {
        const noTasks = document.querySelector(".no-tasks");
        if (noTasks) {
            noTasks.remove();
        }
        const tasks = await this.getTasks(dateKey);
        tasks.push(task);
        await localStorage.setItem(dateKey, JSON.stringify(tasks));
    }

    async deleteTask(dateKey, taskIndex) {
        const tasks = await this.getTasks(dateKey);
        tasks.splice(taskIndex, 1);
        await localStorage.setItem(dateKey, JSON.stringify(tasks));
    }
}

class CalendarView {
    constructor() {
        this.calendarGrid = document.getElementById('calendarGrid');
        this.monthYear = document.getElementById('monthYear');
        this.notesContainer = document.getElementById('notes');
        this.modal = document.getElementById('modal');
        this.modalInput = document.getElementById('modalInput');
        this.modalSave = document.getElementById('modalSave');
        this.modalClose = document.getElementById('modalClose');
        this.addNoteButton = document.getElementById('addNote');
        this.prevMonth = document.getElementById('prevMonth');
        this.nextMonth = document.getElementById('nextMonth');

        this.addNoteButton.style.display = 'none';
    }

    renderCalendar(month, year, selectedDate) {
        this.calendarGrid.innerHTML = '';
        this.monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;
            dayElement.classList.add('day');

            if (selectedDate && day === selectedDate.day && month === selectedDate.month && year === selectedDate.year) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => this.onSelectDate(day, month, year));
            this.calendarGrid.appendChild(dayElement);
        }
        this.clearNotes();
    }

    renderNotes(date, tasks) {
        this.notesContainer.innerHTML = '';

        if (date) {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = `Дата: ${String(date.day).padStart(2, '0')}.${String(date.month + 1).padStart(2, '0')}.${date.year}`;
            dateHeader.classList.add('date-header');
            this.notesContainer.appendChild(dateHeader);
            if (tasks.length > 0) {
                tasks.forEach((task, index) => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task';
                    taskElement.textContent = task;
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-del';
                    deleteBtn.textContent = 'Удалить';
                    deleteBtn.addEventListener('click', () => this.onDeleteTask(index));
                    taskElement.appendChild(deleteBtn);
                    this.notesContainer.appendChild(taskElement);
                });
            } else {
                const noTasksText = document.createElement('p');
                noTasksText.className = 'no-tasks';
                noTasksText.textContent = "У вас нет заметок на этот день.";
                this.notesContainer.appendChild(noTasksText);
            }
        }
    }

    clearSelection() {
        const days = document.querySelectorAll('.day');
        days.forEach(day => day.classList.remove('selected'));
    }

    highlightSelectedDate(day) {
        const dayElements = document.querySelectorAll('.day');
        dayElements.forEach(dayElement => {
            if (parseInt(dayElement.textContent) === day) {
                dayElement.classList.add('selected');
            }
        });
    }


    clearNotes() {
        this.notesContainer.innerHTML = '';
        this.addNoteButton.style.display = 'none';
    }

    openModal() {
        this.modal.classList.add('open');
    }

    closeModal() {
        this.modal.classList.remove('open');
        this.modalInput.value = '';
    }

    bindSelectDate(handler) {
        this.onSelectDate = handler;
    }

    bindDeleteTask(handler) {
        this.onDeleteTask = handler;
    }

    bindModalSave(handler) {
        this.modalSave.addEventListener('click', handler);
    }

    bindModalClose(handler) {
        this.modalClose.addEventListener('click', handler);
    }

    bindAddNoteButton(handler) {
        this.addNoteButton.addEventListener('click', handler);
    }

    bindPrevMonth(handler) {
        this.prevMonth.addEventListener('click', handler);
    }

    bindNextMonth(handler) {
        this.nextMonth.addEventListener('click', handler);
    }
}

class CalendarController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.bindSelectDate(this.handleSelectDate.bind(this));
        this.view.bindDeleteTask(this.handleDeleteTask.bind(this));
        this.view.bindModalSave(this.handleSaveTask.bind(this));
        this.view.bindModalClose(this.handleCloseModal.bind(this));
        this.view.bindAddNoteButton(this.handleOpenModal.bind(this));
        this.view.bindPrevMonth(this.handlePrevMonth.bind(this));
        this.view.bindNextMonth(this.handleNextMonth.bind(this));

        this.init();
    }

    async init() {
        const currentDate = this.model.currentDate;
        if (!this.model.selectedDate) {
            const today = new Date();
            this.model.selectedDate = {
                day: today.getDate(),
                month: today.getMonth(),
                year: today.getFullYear(),
                key: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
            };
        }
        this.view.renderCalendar(currentDate.getMonth(), currentDate.getFullYear(), this.model.selectedDate);
        await this.loadTasksForSelectedDate();
    }

    async loadTasksForSelectedDate() {
        const selectedDate = this.model.selectedDate;
        if (selectedDate) {
            const tasks = await this.model.getTasks(selectedDate.key);
            this.view.renderNotes(selectedDate, tasks);
            this.view.addNoteButton.style.display = 'block';
        }
    }

    async handleSelectDate(day, month, year) {
        const dateKey = `${year}-${month + 1}-${day}`;
        this.model.selectedDate = { day, month, year, key: dateKey };
        this.view.clearSelection();
        this.view.highlightSelectedDate(day);
        await this.loadTasksForSelectedDate();
    }

    async handleDeleteTask(taskIndex) {
        if (this.model.selectedDate) {
            await this.model.deleteTask(this.model.selectedDate.key, taskIndex);
            const tasks = await this.model.getTasks(this.model.selectedDate.key);
            this.view.renderNotes(this.model.selectedDate, tasks);
        }
    }

    async handleSaveTask() {
        const task = this.view.modalInput.value;
        if (this.model.selectedDate && task) {
            await this.model.saveTask(this.model.selectedDate.key, task);
            const tasks = await this.model.getTasks(this.model.selectedDate.key);
            this.view.renderNotes(this.model.selectedDate, tasks);
            this.view.closeModal();
        }
    }

    handleCloseModal() {
        this.view.closeModal();
    }

    handleOpenModal() {
        this.view.openModal();
    }

    async handlePrevMonth() {
        const currentDate = this.model.currentDate;
        currentDate.setMonth(currentDate.getMonth() - 1);
        this.view.renderCalendar(currentDate.getMonth(), currentDate.getFullYear(), this.model.selectedDate);
        await this.checkSelectedDateInCurrentMonth();
    }

    async handleNextMonth() {
        const currentDate = this.model.currentDate;
        currentDate.setMonth(currentDate.getMonth() + 1);
        this.view.renderCalendar(currentDate.getMonth(), currentDate.getFullYear(), this.model.selectedDate);
        await this.checkSelectedDateInCurrentMonth();
    }

    async checkSelectedDateInCurrentMonth() {
        const currentDate = this.model.currentDate;
        const selectedDate = this.model.selectedDate;
        if (selectedDate && selectedDate.month === currentDate.getMonth() && selectedDate.year === currentDate.getFullYear()) {
            await this.loadTasksForSelectedDate();
        }
    }
}

const app = new CalendarController(new CalendarModel(), new CalendarView());