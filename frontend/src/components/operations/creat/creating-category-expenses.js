import {HttpUtils} from "../../../utils/http-utils";

export class CreatingCategoryExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.creatingExpensesInputElement = document.getElementById('creatingExpenseInput');
        document.getElementById('creatingExpensesButton').addEventListener('click', this.saveNewCategoryExpense.bind(this));
        document.getElementById('cancelCreatingExpenses').addEventListener('click', () => {
            this.openNewRoute('/expense');
        });
    }

    validateInputCreatingExpenses() {
        let isValid = true;

        if (this.creatingExpensesInputElement.value) {
            this.creatingExpensesInputElement.classList.remove('is-invalid');
        } else {
            this.creatingExpensesInputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;

    }

    async saveNewCategoryExpense(e) {
        e.preventDefault();

        if (this.validateInputCreatingExpenses()) {
            const createData = {
                title: this.creatingExpensesInputElement.value
            };

            const result = await HttpUtils.request('/categories/expense/', "POST", true, createData);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при создании категории - Расход. Обратитесь в поддержку');
            }

            return this.openNewRoute('/expense');

        }

    }


}