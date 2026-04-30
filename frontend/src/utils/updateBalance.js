import {HttpUtils} from "./http-utils";

export async function refreshBalance() {
    const result = await HttpUtils.request('/balance');
    if (result.error) {
        console.error('Ошибка получения баланса:', result);
        return;
    }
    console.log('Результат запроса:', result);

    const balanceData = result.response;
    const balanceElement = document.getElementById('balance');
    if (balanceElement && balanceData && balanceData.balance !== undefined) {
        balanceElement.textContent = `Баланс: ${balanceData.balance}`;
    }
}