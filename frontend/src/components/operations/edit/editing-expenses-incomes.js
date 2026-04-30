import {HttpUtils} from "../../../utils/http-utils";

export class EditingExpensesIncomes {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('editing-expenses-incomes').addEventListener('click', (e) => {
            this.updateOperationExpenseIncome(e)
        })

        document.getElementById('cancel-editing-expenses-incomes').addEventListener('click', function () {
            window.location.href = '/incomes-and-expenses';
        });

        this.typeSelectElement = document.getElementById('type-select');
        this.categorySelectElement = document.getElementById('category-select');
        this.sumInputElement = document.getElementById('sumInput');
        this.dateInputElement = document.getElementById('dateInput');
        this.commentInputElement = document.getElementById('commentInput');

        this.getCategoryExpensesIncomes(id).then();
    }

    async getCategoryExpensesIncomes(id) {
        const result = await HttpUtils.request('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }
        // console.log(result)

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе фрилансера. Обратитесь в поддержку');
        }

        this.categoryExpenseIncomeOriginalData = result.response;
        console.log(this.categoryExpenseIncomeOriginalData)
        this.showCategoryExpensesIncomes(result.response);
    }

    async loadCategoriesExpenseIncomes() {
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
        // console.log('Категории, полученные с сервера:', result.response);

        this.populateCategorySelect(result.response);
        // console.log(result.response)
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

    async showCategoryExpensesIncomes(response) {
        // Устанавливаем остальные поля
        this.typeSelectElement.value = response.type;
        this.sumInputElement.value = response.amount;
        this.dateInputElement.value = response.date;
        this.commentInputElement.value = response.comment;

        // Устанавливаем выбранный тип
        for (let i = 0; i < this.typeSelectElement.options.length; i++) {
            if (this.typeSelectElement.options[i].value === response.type) {
                this.typeSelectElement.selectedIndex = i;
                break;
            }
        }

        // Загружаем категории
        await this.loadCategoriesExpenseIncomes();

        // После загрузки категорий ищем нужную по тексту
        const options = Array.from(this.categorySelectElement.options);
        const matchingOption = options.find(opt => opt.text.trim() === response.category);

        if (matchingOption) {
            this.categorySelectElement.value = matchingOption.value;
        } else {
            console.warn(`Категория с именем="${response.category}" не найдена в списке`);
            // Можно оставить выбор по умолчанию или добавить новую категорию
        }
    }

    validateInputEditingExpenseIncome() {
        let isValid = true;

        let textInputArray = [
            this.sumInputElement,
            this.dateInputElement,
            this.commentInputElement,
        ];

        for (let i = 0; i < textInputArray.length; i++) {
            if (textInputArray[i].value) {
                textInputArray[i].classList.remove('is-invalid');
            } else {
                textInputArray[i].classList.add('is-invalid');
                isValid = false;
            }
        }
        return isValid;
    }

    async updateOperationExpenseIncome(e) {
        e.preventDefault();

        if (this.validateInputEditingExpenseIncome()) {

            const formData = {
                type: this.typeSelectElement.value,
                category_id: parseInt(this.categorySelectElement.value),
                amount: this.sumInputElement.value,
                date: this.dateInputElement.value,
                comment: this.commentInputElement.value,
            };

            if (Object.keys(formData).length > 0) {
                console.log('Отправляемые данные:', formData);
                const result = await HttpUtils.request('/operations/' + this.categoryExpenseIncomeOriginalData.id, "PUT", true, formData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                console.log(this.categoryExpenseIncomeOriginalData)

                if (result.error || !result.response || (result.response && result.response.error)) {
                    console.log(result.response.message);
                    return alert('Возникла ошибка при редактировании операции. Обратитесь в поддержку');
                }

                return this.openNewRoute('/incomes-and-expenses');

            }
        }
    }

}