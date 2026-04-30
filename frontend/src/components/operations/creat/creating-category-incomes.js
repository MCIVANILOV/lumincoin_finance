import {HttpUtils} from "../../../utils/http-utils";

export class CreatingCategoryIncomes {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.creatingIncomesInputElement = document.getElementById('creatingIncomesInput');
        document.getElementById('creatingIncomesButton').addEventListener('click', this.saveNewCategoryIncome.bind(this));
        document.getElementById('cancelCreatingIncomes').addEventListener('click', () => {
            this.openNewRoute('/income');
        });
    }

    validateInputCreatingIncomes() {
        let isValid = true;

        if (this.creatingIncomesInputElement.value) {
            this.creatingIncomesInputElement.classList.remove('is-invalid');
        } else {
            this.creatingIncomesInputElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;

    }

    async saveNewCategoryIncome(e) {
        e.preventDefault();

        if (this.validateInputCreatingIncomes()) {
            const createData = {
                title: this.creatingIncomesInputElement.value
            };

            const result = await HttpUtils.request('/categories/income/', "POST", true, createData);
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.response.error)) {
                console.log(result.response.message);
                return alert('Возникла ошибка при создании категории - Доход. Обратитесь в поддержку');
            }

            return this.openNewRoute('/income');

        }

    }

}