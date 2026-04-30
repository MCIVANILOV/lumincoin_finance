import {HttpUtils} from "../../utils/http-utils";
import { initCharts, updateCharts } from '../../../scripts/charts.js';
import {AuthUtils} from "../../utils/auth-utils";

export class Main {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.currentFilters = {};
        // Проверка авторизации
        const authInfo = AuthUtils.getAuthInfo();
        const token = authInfo[AuthUtils.accessTokenKey];

        if (!token) {
            // Токена нет - редирект на логин
            window.location.href = '/login'; // или другой путь к странице логина
            return; // остановить дальнейшую инициализацию
        }
        // Инициализация графиков
        initCharts();

        this.operationsWithFiltersOnMain();

        // Обновление данных графиков
        this.loadAndUpdateGraphs();
    }

    async loadAndUpdateGraphs() {
        try {
            await updateCharts(this.currentFilters);
            // console.log(this.currentFilters)

        } catch (err) {
            console.error('Ошибка при обновлении графиков:', err);
        }
    }

    operationsWithFiltersOnMain() {
        const container = document.querySelector('.main-filters');
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
        const fetchData = async ({ period, dateFrom, dateTo }) => {
            this.currentFilters = { period, dateFrom, dateTo };
            const baseUrl = '/operations';
            console.log('Вызывается fetchData с параметрами:', { period, dateFrom, dateTo });
            const urlParams = new URLSearchParams();
            urlParams.append('period', period);
            if (dateFrom) {
                urlParams.append('dateFrom', dateFrom);
            }
            if (dateTo) {
                urlParams.append('dateTo', dateTo);
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

            this.loadAndUpdateGraphs(result.response);
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
                    fetchData({ period, dateFrom: null, dateTo: null });
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
            console.log('Вызывается fetchData с interval', { period: 'interval', dateFrom: from, dateTo: to });
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
}