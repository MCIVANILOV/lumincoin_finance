import {HttpUtils} from "../../utils/http-utils";

export class Expenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.selectedOperationId = null; // переменная для хранения id выбранной категории
        this.initEventListeners(); // инициализация делегированных событий
        this.getCategoriesExpenses().then();
    }

    async getCategoriesExpenses() {
        const result = await HttpUtils.request('/categories/expense/');

        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert('Возникла ошибка при запросе фрилансеров. Обратитесь в поддержку');
        }

        this.showCategoriesExpenses(result.response);
    }

    showCategoriesExpenses(response) {
        const expenseContainer = document.getElementById('expense-item');
        const createNewCategoryExpense = document.getElementById('create-new-category-expense');

        // Очистить контейнер перед добавлением новых элементов (рекомендуется)
        expenseContainer.innerHTML = '';

        response.forEach(item => {
            const cardDivExpense = document.createElement('div');
            cardDivExpense.className = 'fin-item col';

            const titleDivExpense = document.createElement('div');
            titleDivExpense.className = 'fin-item-title main-subtitle';
            titleDivExpense.innerText = item.title;
            cardDivExpense.appendChild(titleDivExpense);

            const buttonsDivExpense = document.createElement('div');
            buttonsDivExpense.className = 'fin-item-buttons';

            const editLinkExpense = document.createElement('a');
            editLinkExpense.href = 'editing-category-expenses?id=' + item.id;
            editLinkExpense.className = 'main-item-button fin-item-button-1 me-1';
            editLinkExpense.innerText = 'Редактировать';

            const deleteButtonExpense = document.createElement('button');
            deleteButtonExpense.className = 'main-item-button fin-item-button-2 delete-btn';
            deleteButtonExpense.setAttribute('data-bs-toggle', 'modal');
            deleteButtonExpense.setAttribute('data-bs-target', '#exampleModal');
            deleteButtonExpense.setAttribute('data-id', item.id);
            deleteButtonExpense.innerText = 'Удалить';

            buttonsDivExpense.appendChild(editLinkExpense);
            buttonsDivExpense.appendChild(deleteButtonExpense);
            cardDivExpense.appendChild(buttonsDivExpense);

            expenseContainer.appendChild(cardDivExpense);
        });

        expenseContainer.appendChild(createNewCategoryExpense);
    }

    // Инициализация делегированных событий
    async initEventListeners() {
        const container = document.getElementById('expense-item');

        // Делегирование кликов по кнопкам "Удалить"
        container.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('delete-btn')) {
                this.selectedOperationId = e.target.getAttribute('data-id');
                console.log('Обнаружена кнопка для удаления', this.selectedOperationId);
                // тут, например, показываем модальное окно
            }
        });

        // Обработчик для подтверждения удаления (кнопка в модальном, например, с id='delete-income-category')
        const deleteConfirmBtn = document.getElementById('delete-expense-category');
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => {
                console.log('Кнопка "Да, удалить" нажата', this.selectedOperationId);
                if (this.selectedOperationId) {
                    // Вызовите функцию удаления, например
                    this.deleteCategoryExpense(this.selectedOperationId);
                }
            });
        }
    }

    async deleteCategoryExpense(id) {
        const result = await HttpUtils.request('/categories/expense/' + id, "DELETE", true);
        console.log(result)
        if (result.redirect) {
            return this.openNewRoute('/');
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при удалении категории - Доход. Обратитесь в поддержку');
        }

        console.log(result)

        return window.location.href = '/expense';
    }

}