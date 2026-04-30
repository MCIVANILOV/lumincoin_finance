import {HttpUtils} from "../../utils/http-utils";

export class Incomes {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.selectedOperationId = null; // переменная для хранения id выбранной категории
        this.initEventListeners(); // инициализация делегированных событий
        this.getCategoriesIncomes().then();
    }

    async getCategoriesIncomes() {
        const result = await HttpUtils.request('/categories/income/');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response))) {
            return alert('Возникла ошибка при запросе фрилансеров. Обратитесь в поддержку');
        }

        this.showCategoriesIncomes(result.response);
    }

    showCategoriesIncomes(response) {
        const incomeContainer = document.getElementById('income-item');
        const createNewCategoryIncome = document.getElementById('create-new-category-income');

        // Очистить контейнер перед добавлением новых элементов (рекомендуется)
        incomeContainer.innerHTML = '';

        response.forEach(item => {
            const cardDivIncome = document.createElement('div');
            cardDivIncome.className = 'fin-item col';

            const titleDivIncome = document.createElement('div');
            titleDivIncome.className = 'fin-item-title main-subtitle';
            titleDivIncome.innerText = item.title;
            cardDivIncome.appendChild(titleDivIncome);

            const buttonsDivIncome = document.createElement('div');
            buttonsDivIncome.className = 'fin-item-buttons';

            const editLinkIncome = document.createElement('a');
            editLinkIncome.href = 'editing-category-incomes?id=' + item.id;
            editLinkIncome.className = 'main-item-button fin-item-button-1 me-1';
            editLinkIncome.innerText = 'Редактировать';

            const deleteButtonIncome = document.createElement('button');
            deleteButtonIncome.className = 'main-item-button fin-item-button-2 delete-btn';
            deleteButtonIncome.setAttribute('data-bs-toggle', 'modal');
            deleteButtonIncome.setAttribute('data-bs-target', '#exampleModal');
            deleteButtonIncome.setAttribute('data-id', item.id);
            deleteButtonIncome.innerText = 'Удалить';

            buttonsDivIncome.appendChild(editLinkIncome);
            buttonsDivIncome.appendChild(deleteButtonIncome);
            cardDivIncome.appendChild(buttonsDivIncome);

            incomeContainer.appendChild(cardDivIncome);
        });

        // Вставляем кнопку "Создать новую категорию" обратно, если нужно, позже
        incomeContainer.appendChild(createNewCategoryIncome);
    }

    // Инициализация делегированных событий
    async initEventListeners() {
        const container = document.getElementById('income-item');

        // Делегирование кликов по кнопкам "Удалить"
        container.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('delete-btn')) {
                this.selectedOperationId = e.target.getAttribute('data-id');
                console.log('Обнаружена кнопка для удаления', this.selectedOperationId);
                // тут, например, показываем модальное окно
            }
        });

        // Обработчик для подтверждения удаления (кнопка в модальном, например, с id='delete-income-category')
        const deleteConfirmBtn = document.getElementById('delete-income-category');
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => {
                console.log('Кнопка "Да, удалить" нажата', this.selectedOperationId);
                if (this.selectedOperationId) {
                    // Вызовите функцию удаления, например
                    this.deleteCategoryIncome(this.selectedOperationId);
                }
            });
        }
    }

    async deleteCategoryIncome(id) {
        const result = await HttpUtils.request('/categories/income/' + id, "DELETE", true);
        console.log(result)
        if (result.redirect) {
            return this.openNewRoute('/');
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            console.log(result.response.message);
            return alert('Возникла ошибка при удалении категории - Доход. Обратитесь в поддержку');
        }

        console.log(result)

        return window.location.href = '/income';
    }

}