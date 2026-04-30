import {HttpUtils} from "../../../utils/http-utils";

export class EditingCategoryExpenses {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('creat-expense').addEventListener('click', this.updateCategoryExpense.bind(this));
        document.getElementById('cancel-creating-expense').addEventListener('click', function () {
            window.location.href = '/expense';
        });

        this.editCategoryExpenseElement = document.getElementById('edit-category-expense');

        this.getCategoryExpenses(id).then();
    }

    async getCategoryExpenses(id) {
        const result = await HttpUtils.request('/categories/expense/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе категорий - Расход. Обратитесь в поддержку');
        }

        this.categoryExpenseOriginalData = result.response;
        this.showCategoryExpense(result.response);
    }

    showCategoryExpense(response) {
        this.editCategoryExpenseElement.value = response.title;
    }

    validateInputEditingIncome() {
        let isValid = false;

        if (this.editCategoryExpenseElement.value <= 0) {
            this.editCategoryExpenseElement.classList.add('is-invalid');
        } else {
            this.editCategoryExpenseElement.classList.remove('is-invalid');
            isValid = true;
        }
        return isValid;
    }

    async updateCategoryExpense(e) {
        e.preventDefault();

        if (this.validateInputEditingIncome()) {

            const changedData = {};
            if (this.editCategoryExpenseElement.value !== this.categoryExpenseOriginalData.title) {
                changedData.title = this.editCategoryExpenseElement.value;
            }

            if (Object.keys(changedData).length > 0) {
                const result = await HttpUtils.request('/categories/expense/' + this.categoryExpenseOriginalData.id, "PUT", true, changedData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }


                if (result.error || !result.response || (result.response && result.response.error)) {
                    console.log(result.response.message);
                    return alert('Возникла ошибка при редактировании категории - Расход. Обратитесь в поддержку');
                }

                return this.openNewRoute('/expense');

            }
        }
    }
}