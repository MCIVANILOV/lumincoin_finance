import {HttpUtils} from "../../utils/http-utils";

export class IncomesAndExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.selectedOperationId = null; // переменная для хранения id выбранной категории
        this.getOperations().then();
        this.initEventListeners(); // инициализация делегированных событий
        document.getElementById('buttonIncome').addEventListener('click', () => window.location.href = '/creating-expenses-incomes?type=income');
        document.getElementById('buttonExpense').addEventListener('click', () => window.location.href = '/creating-expenses-incomes?type=expense');

        this.operationsWithFilters();

    }

    async getOperations() {
        const result = await HttpUtils.request('/operations');

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе фрилансера. Обратитесь в поддержку');
        }

        this.showOperations(result.response);
    }

    showOperations(response) {
        const recordsElement = document.getElementById('records');
        recordsElement.innerHTML = ''; // очистить таблицу перед добавлением

        response.forEach(item => {
            const trElement = document.createElement('tr');

            // id
            const thElement = document.createElement('th');
            thElement.setAttribute('scope', 'row');
            thElement.innerText = item.id;
            trElement.appendChild(thElement);

            // Тип операции - с переводом и цветом
            const tdType = document.createElement('td');

            let typeText = '';
            let colorStyle = '';

            if (item.type === 'income') {
                typeText = 'Доход';
                colorStyle = 'color: green;';
            } else if (item.type === 'expense') {
                typeText = 'Расход';
                colorStyle = 'color: red;';
            } else {
                typeText = item.type; // если есть неожиданный тип
            }

            tdType.innerText = typeText;
            tdType.setAttribute('style', colorStyle);
            trElement.appendChild(tdType);

            // Категория - с обработкой undefined
            const tdCategory = document.createElement('td');
            tdCategory.innerText = (item.category === undefined || item.category === null || item.category === '') ? 'Без категории' : item.category;
            trElement.appendChild(tdCategory);

            // Остальные поля
            const tdAmount = document.createElement('td');
            tdAmount.innerText = item.amount;
            trElement.appendChild(tdAmount);

            const tdDate = document.createElement('td');
            tdDate.innerText = item.date;
            trElement.appendChild(tdDate);

            const tdComment = document.createElement('td');
            tdComment.innerText = item.comment;
            trElement.appendChild(tdComment);

            const tdEditButtons = document.createElement('td');
            tdEditButtons.classList.add('edit-buttons');
            tdEditButtons.setAttribute('data-id', item.id);
            tdEditButtons.innerHTML = `
            <img src="../../static/images/trash-icon.svg" alt="Корзина" class="me-3 delete-btn" style="cursor: pointer" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#exampleModal">
            <a href="/editing-expenses-incomes?id=${item.id}">
              <img src="../../static/images/pen-icon.svg" alt="Карандаш" class="me-1" style="cursor: pointer">
            </a>
        `;
            trElement.appendChild(tdEditButtons);

            recordsElement.appendChild(trElement);
        });
    }

    operationsWithFilters() {
        const container = document.querySelector('.expenses-incomes-filters');
        const buttons = container.querySelectorAll('button[data-period]');
        const dateFromInput = container.querySelector('input[type="date"]:nth-of-type(1)');
        const dateToInput = container.querySelector('input[type="date"]:nth-of-type(2)');

        // Кнопка "Применить" для интервала (создаем или находим)
        let applyBtn = container.querySelector('#apply-interval');
        if (!applyBtn) {
            applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.id = 'apply-interval';
            applyBtn.textContent = 'Применить';
            const customFilterDiv = container.querySelector('.custom-filter');
            customFilterDiv.appendChild(applyBtn);
            customFilterDiv.style.display = 'none'; // Скрываем по умолчанию
        }

        function toggleIntervalInputs(show) {
            const custom = container.querySelector('.custom-filter');
            custom.style.display = show ? 'flex' : 'none';
        }

        function setActiveButton(chosenBtn) {
            buttons.forEach(btn => {
                btn.classList.toggle('active', btn === chosenBtn);
                btn.classList.toggle('my-active-btn', btn === chosenBtn);
            });
        }

        // Объявляем fetchData как стрелочную функцию, чтобы сохранить контекст this
        const fetchData = async (params) => {
            if (!params || !params.period || params.period.trim() === '') {
                console.error('Ошибка: параметр "period" должен быть задан и не должен быть пустым.');
                return;
            }

            const baseUrl = '/operations';

            const urlParams = new URLSearchParams();
            urlParams.append('period', params.period);
            if (params.dateFrom) {
                urlParams.append('dateFrom', params.dateFrom);
            }
            if (params.dateTo) {
                urlParams.append('dateTo', params.dateTo);
            }

            const url = `${baseUrl}?${urlParams.toString()}`;

            const result = await HttpUtils.request(url);

            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                alert('Возникла ошибка при запросе операций. Обратитесь в поддержку');
                return;
            }

            this.showOperations(result.response);
        };

        // Обработчики кнопок периодов
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                setActiveButton(button);

                const period = button.dataset.period || button.textContent.toLowerCase();

                if (period === 'interval') {
                    toggleIntervalInputs(true);
                } else {
                    toggleIntervalInputs(false);
                    fetchData({ period });
                }
            });
        });

        // Обработчик "Применить" для интервала
        applyBtn.addEventListener('click', () => {
            const from = dateFromInput.value;
            const to = dateToInput.value;

            if (!from || !to) {
                alert('Пожалуйста, укажите оба значения даты: с и по.');
                return;
            }

            fetchData({ period: 'interval', dateFrom: from, dateTo: to });
        });

        // Изначально скрываем блок интервала, если не выбран интервал
        const activeBtn = container.querySelector('button.active');
        if (!activeBtn || activeBtn.dataset.period !== 'interval') {
            toggleIntervalInputs(false);
        } else {
            toggleIntervalInputs(true);
        }
    }

    // Инициализация делегированных событий
    async initEventListeners() {
        const container = document.getElementById('records');

        // Делегирование кликов по кнопкам "Удалить"
        container.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('delete-btn')) {
                this.selectedOperationId = e.target.getAttribute('data-id');
                console.log('Обнаружена кнопка для удаления', this.selectedOperationId);
                // тут, например, показываем модальное окно
            }
        });

        // Обработчик для подтверждения удаления (кнопка в модальном, например, с id='delete-income-category')
        const deleteConfirmBtn = document.getElementById('delete-operation-button');
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => {
                console.log('Кнопка "Да, удалить" нажата', this.selectedOperationId);
                if (this.selectedOperationId) {
                    // Вызовите функцию удаления, например
                    this.deleteOperationExpenseIncome(this.selectedOperationId);
                }
            });
        }
    }

    async deleteOperationExpenseIncome(id) {
        const result = await HttpUtils.request('/operations/' + id, "DELETE", true);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при удалении категории - Доход. Обратитесь в поддержку');
        }

        console.log(result)

        return window.location.href = '/incomes-and-expenses';
    }


}