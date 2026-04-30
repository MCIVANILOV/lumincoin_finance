import {HttpUtils} from "../src/utils/http-utils";

let myChart1 = null;
let myChart2 = null;

export function initCharts() {
    const canvas1 = document.getElementById('myChart');
    const canvas2 = document.getElementById('myChart2');

    if (!canvas1 || !canvas2) {
        // Элементы canvas еще не в DOM — выходим
        return;
    }

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    if (myChart1) {
        myChart1.destroy();
    }
    if (myChart2) {
        myChart2.destroy();
    }

    myChart1 = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
            datasets: [{
                label: 'Сумма',
                data: [16, 19, 6, 5, 3],
                backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                borderWidth: 1,
                color: 'black'
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {family: "Roboto-Medium", size: 12},
                        color: 'black',
                    }
                }
            }
        }
    });

    myChart2 = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
            datasets: [{
                label: 'Сумма',
                data: [3, 6, 16, 15, 7],
                backgroundColor: ['#DC3545', '#FD7E14', '#FFC107', '#20C997', '#0D6EFD'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {family: "Roboto-Medium", size: 12},
                        color: 'black',
                    }
                }
            }
        }
    });

}

/**
 * Обновление данных графиков
 */
export async function updateCharts(filterParams = {}) {
    const incomeData = await fetchOperations('income', filterParams);
    const expenseData = await fetchOperations('expense', filterParams);

    if (!incomeData || !expenseData) {
        console.warn('Некорректные данные для графиков');
        return;
    }

    if (myChart1 && incomeData) {
        myChart1.data.labels = incomeData.labels;             // Категории (метки)
        myChart1.data.datasets[0].data = incomeData.amounts;  // Значения
        myChart1.data.datasets[0].backgroundColor = incomeData.colors; // Цвета
        myChart1.update();
        // console.log(incomeData)
    }

    if (myChart2 && expenseData) {
        myChart2.data.labels = expenseData.labels;
        myChart2.data.datasets[0].data = expenseData.amounts;
        myChart2.data.datasets[0].backgroundColor = expenseData.colors;
        myChart2.update();
    }
}

/**
 * Получение и группировка данных
 */
async function fetchOperations(type, filterParams = {}) {
    const { period, dateFrom, dateTo } = filterParams;

    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (period) params.append('period', period);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    const url = `/operations?${params.toString()}`; // формируем строку запроса

    const result = await HttpUtils.request(url); // отправляем запрос

    if (result.error) {
        console.error("Ошибка загрузки данных", result);
        return { labels: [], amounts: [], colors: [] };
    }

    const data = result.response;

    // фильтр по типу (если нужен)
    const filtered = data.filter(op => op.type === type);

    const labels = filtered.map(op => {
        if (!op.category || op.category.trim() === '') {
            return 'Без категории';
        }
        return op.category;
    });
    const amounts = filtered.map(op => op.amount);
    const colors = filtered.map((_, index) => getColor(index));
    return { labels, amounts, colors };


}

// Генерация цветовых значений для категорий
function getColor(index) {
    const hue = index * 137.5; // использование золотого сечения
    return `hsl(${hue % 360}, 70%, 50%)`;
}
