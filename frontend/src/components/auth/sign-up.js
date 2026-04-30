import {AuthUtils} from "../../utils/auth-utils.js";
import {HttpUtils} from "../../utils/http-utils.js";

export class SignUp {

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) {
            return this.openNewRoute('/login');
        }

        this.nameElement = document.getElementById('first-name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.commonErrorElement = document.getElementById('commonError');

        document.getElementById('signUp').addEventListener('click', this.signUp.bind(this));

    }

    validateForm() {
        let isValid = true;

        if (this.nameElement.value && this.nameElement.value.match(/^[А-Я][а-я]+\s*$/)) {
            this.nameElement.classList.remove('is-invalid');
        } else {
            this.nameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.lastNameElement.value && this.lastNameElement.value.match(/^[А-Я][а-я]+\s*$/)) {
            this.lastNameElement.classList.remove('is-invalid');
        } else {
            this.lastNameElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.emailElement.value && this.emailElement.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
            this.passwordRepeatElement.classList.remove('is-invalid');
        } else {
            this.passwordRepeatElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async signUp(e) {
        e.preventDefault();
        this.commonErrorElement.style.display = 'none';
        if (this.validateForm()) {
            // Шаг 1: Регистрация пользователя
            const regResult = await HttpUtils.request('/signup', 'POST', false, {
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            });

            if (regResult.error || !regResult.response || (regResult.response && (!regResult.response.user || !regResult.response.user.id))) {
                this.commonErrorElement.textContent = 'Ошибка регистрации.';
                this.commonErrorElement.style.display = 'block';
                return;
            }

            // Шаг 2: Выполняем логин для получения токенов
            const loginResult = await HttpUtils.request('/login', 'POST', false, {
                email: this.emailElement.value,
                password: this.passwordElement.value
            });

            console.log(loginResult)

            if (loginResult.error || (!loginResult.response.user || !loginResult.response.user.id) || !loginResult.response.tokens.accessToken || !loginResult.response.tokens.refreshToken) {
                this.commonErrorElement.textContent = 'Не удалось авторизоваться автоматически.';
                this.commonErrorElement.style.display = 'block';
                return;
            }

            // Шаг 3: Сохраняем токены и info пользователя
            AuthUtils.setAuthInfo(
                loginResult.response.tokens.accessToken,
                loginResult.response.tokens.refreshToken,
                {
                    id: regResult.response.user.id,
                    name: regResult.response.user.name
                }
            );

            // Шаг 4: Перенаправляем на главную страницу
            this.openNewRoute('/'); // или другая целевая страница
        }
    }
}