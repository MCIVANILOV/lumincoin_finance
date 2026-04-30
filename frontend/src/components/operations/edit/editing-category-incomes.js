import {HttpUtils} from "../../../utils/http-utils";

export class EditingCategoryIncomes {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        const urlParams = new URLSearchParams(window.location.search);

        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('creat-income').addEventListener('click', this.updateCategoryIncome.bind(this));
        document.getElementById('cancel-creating-income').addEventListener('click', function() {
            window.location.href = '/income';
        });

        this.editCategoryIncomesElement = document.getElementById('edit-category-incomes');

        this.getCategoryIncomes(id).then();
    }

    async getCategoryIncomes(id) {
        const result = await HttpUtils.request('/categories/income/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при запросе категорий - Доход. Обратитесь в поддержку');
        }

        this.categoryIncomeOriginalData = result.response;
        this.showCategoryIncomes(result.response);
    }

    showCategoryIncomes(response) {
        this.editCategoryIncomesElement.value = response.title;
        console.log(response.title)
    }

    validateInputEditingIncome() {
        let isValid = false;

        if (this.editCategoryIncomesElement.value <= 0) {
            this.editCategoryIncomesElement.classList.add('is-invalid');
        } else {
            this.editCategoryIncomesElement.classList.remove('is-invalid');
            isValid = true;
        }
        return isValid;
    }

    async updateCategoryIncome(e) {
        e.preventDefault();

        if (this.validateInputEditingIncome()) {

            const changedData = {};
            if (this.editCategoryIncomesElement.value !== this.categoryIncomeOriginalData.title) {
                changedData.title = this.editCategoryIncomesElement.value;
            }

            if (Object.keys(changedData).length > 0) {
                const result = await HttpUtils.request('/categories/income/' + this.categoryIncomeOriginalData.id, "PUT", true, changedData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                console.log(this.categoryIncomeOriginalData.id)

                if (result.error || !result.response || (result.response && result.response.error)) {
                    console.log(result.response.message);
                    return alert('Возникла ошибка при редактировании категории - Доход. Обратитесь в поддержку');
                }

                return this.openNewRoute('/income');

            }
        }
    }
}