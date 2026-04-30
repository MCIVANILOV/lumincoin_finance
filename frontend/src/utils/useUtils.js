import {AuthUtils} from "./auth-utils";

export function updateUserName() {
    const userInfoJson = AuthUtils.getAuthInfo('userInfo');
    const userSpan = document.getElementById('userName');
    if (!userSpan) return;

    if (userInfoJson) {
        try {
            const userInfo = JSON.parse(userInfoJson);
            userSpan.innerText = (userInfo && userInfo.name) ? userInfo.name : 'Гость';
        } catch (e) {
            console.error('Ошибка парсинга userInfo:', e);
            userSpan.innerText = 'Гость';
        }
    } else {
        userSpan.innerText = 'Гость';
    }
}