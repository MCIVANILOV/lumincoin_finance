import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Logout} from "./components/auth/logout";
import {Main} from "./components/pages/main";
import {CreatingCategoryExpenses} from "./components/operations/creat/creating-category-expenses";
import {CreatingCategoryIncomes} from "./components/operations/creat/creating-category-incomes";
import {CreatingExpensesIncomes} from "./components/operations/creat/creating-expenses-incomes";
import {EditingCategoryExpenses} from "./components/operations/edit/editing-category-expenses";
import {EditingCategoryIncomes} from "./components/operations/edit/editing-category-incomes";
import {EditingExpensesIncomes} from "./components/operations/edit/editing-expenses-incomes";
import {Expenses} from "./components/pages/expenses";
import {Incomes} from "./components/pages/incomes";
import {IncomesAndExpenses} from "./components/pages/incomes-and-expenses";
import * as useUtils from "./utils/useUtils";
import * as updateBalance from "./utils/updateBalance";

export class Router {

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/pages/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Main(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/creating-category-expenses',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/operations/creating-category-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreatingCategoryExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/editing-category-expenses',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/operations/editing-category-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditingCategoryExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/creating-category-incomes',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/operations/creating-category-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreatingCategoryIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/editing-category-incomes',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/operations/editing-category-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditingCategoryIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/creating-expenses-incomes',
                title: 'Создание дохода / расхода',
                filePathTemplate: '/templates/operations/creating-expenses-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreatingExpensesIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/editing-expenses-incomes',
                title: 'Редактирование дохода / расхода',
                filePathTemplate: '/templates/operations/editing-expenses-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditingExpensesIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/expense',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Incomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/incomes-and-expenses',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/incomes-and-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesAndExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/auth/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/auth/sign-up.html',
                useLayout: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            },
        ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        window.addEventListener('click', this.clickHandler.bind(this));

        window.toggleMenu = function (e) {
            e.classList.toggle("active");
            document.querySelector("aside").classList.toggle("active");
        }


    }

    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);

    }

    async clickHandler(e) {
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();

            const url = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            await this.openNewRoute(url);
        }
    }

    async activateRoute() {

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {

            if (newRoute.title) {
                this.titlePageElement.innerText = newRoute.title + ' | Lumincoin Finance';
            }

            if (newRoute.filePathTemplate) {
                let contentBlock = this.contentPageElement;
                if (newRoute.useLayout) {
                    this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');
                }
                contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }
        }

        useUtils.updateUserName();
        await updateBalance.refreshBalance();

    }

}


