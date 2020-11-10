const keys = require('../keys')

module.exports = function (email, password) {
    return {
        to: email,
        from: `MaridiM ${keys.EMAIL_FROM}`,
        subject: 'Акаунт создан',
        html: `
            <h1>Добро пожаловать в наш  магазин</h1>
            <p>Вы  успешно  создали аккаунт с email: ${email}</p>
            <p>Ваш пароль: ${password}</p>
            <hr />
            <a href="${keys.BASE_URL}">Магазин курсов</a>
        `
    }
}