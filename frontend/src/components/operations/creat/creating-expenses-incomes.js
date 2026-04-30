import {HttpUtils} from "../../../utils/http-utils";

export class CreatingExpensesIncomes {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.typeSelectElement = document.getElementById('type-select');
        this.categorySelectElement = document.getElementById('category-select');
        this.sumInputElement = document.getElementById('sumInput');
        this.dateInputElement = document.getElementById('dateInput');
        this.commentInputElement = document.getElementById('commentInput');

        this.setTypeFromUrl();

        this.typeSelectElement.addEventListener('change', () => this.loadCategories());

        if (this.typeSelectElement.value) {
            this.loadCategories();
        }

        document.getElementById('create-incomes-expenses').addEventListener('click', this.createOperation.bind(this));
        document.getElementById('cancel-create-operation').addEventListener('click', () => {
            window.location.href = '/incomes-and-expenses';
        });
    }

    setTypeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        if (typeParam && this.typeSelectElement) {
            let valueToSet = '';

            if (typeParam === 'income') {
                valueToSet = 'income';
            } else if (typeParam === 'expense') {
                valueToSet = 'expense';
            } else {
                valueToSet = typeParam;
            }

            const option = this.typeSelectElement.querySelector(`option[value="${valueToSet}"]`);
            if (option) {
                this.typeSelectElement.value = valueToSet;
            } else {
                console.warn('Опция не найдена:', valueToSet);
            }
        }
    }

    async loadCategories() {
        const selectedType = this.typeSelectElement.value;

        // Проверка и формирование URL по типу
        if (selectedType !== 'income' && selectedType !== 'expense') {
            this.categorySelectElement.innerHTML = '<option value="">Сначала выберите тип</option>';
            return;
        }

        const url = `/categories/${selectedType}`; // Общий путь вместо двух условий
        const result = await HttpUtils.request(url);
        if (result.redirect) {
            this.openNewRoute(result.redirect);
            return;
        }

        if (result.error) {
            console.error('Ошибка при загрузке категорий:', result.error);
            this.categorySelectElement.innerHTML = '<option value="">Ошибка при загрузке категорий</option>';
            return;
        }

        // Логирование для проверки полученных данных
        console.log('Категории, полученные с сервера:', result.response);

        this.populateCategorySelect(result.response);
    }

    populateCategorySelect(categories) {
        // Очистка предыдущих вариантов и добавление подсказки
        this.categorySelectElement.innerHTML = '<option value="">Выберите категорию</option>';

        // Заполнение select новыми категориями
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;     // Значение — id категории
            option.textContent = cat.title; // Текст — название категории
            this.categorySelectElement.appendChild(option);
        });
    }

    validateField() {
        let isValid = true;
        if (this.categorySelectElement && this.categorySelectElement.value !== "") {
            this.categorySelectElement.classList.remove('is-invalid');
        } else {
            this.categorySelectElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.sumInputElement.value) {
            this.sumInputElement.classList.remove('is-invalid');
        } else {
            this.sumInputElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.dateInputElement.value) {
            this.dateInputElement.classList.remove('is-invalid');
        } else {
            this.dateInputElement.classList.add('is-invalid');
            isValid = false;
        }
        if (this.commentInputElement.value) {
            this.commentInputElement.classList.remove('is-invalid');
        } else {
            this.commentInputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async createOperation(e) {
        e.preventDefault();

        if (this.validateField()) {
            const formData = {
                type: this.typeSelectElement.value,
                category_id: parseInt(this.categorySelectElement.value),
                amount: this.sumInputElement.value,
                date: this.dateInputElement.value,
                comment: this.commentInputElement.value,
            };

            console.log('Выбранный тип:', formData.type);
            console.log('Выбранная категория:', formData.category_id);
            console.log('Сумма:', formData.amount);

            const result = await HttpUtils.request('/operations', "POST", true, formData);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            console.log('Отправляемые данные операции:', formData);
            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при добавлении операции.');
            }

            return this.openNewRoute('/incomes-and-expenses');
        }
    }
}