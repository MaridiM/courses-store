const keys = require('../keys')

module.exports = function (email, token) {
    return {
        to: email,
        from: `MaridiM ${keys.EMAIL_FROM}`,
        subject: 'Восстановление доступа',
        html: `
            <h1>Вы забыли пароль,</h1>
            <p>Если нет то проигнорируйте данное письмо.</p>
            <p>Иначе нажмите на ссылку ниже:</p>
            <p><a href='${keys.BASE_URL}/auth/password/${token}'>Восстановить пароль</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Магазин курсов</a>
        `
    }
}