const MailBase = require('./MailBase');
const Env = use('Env');

class RecoveryPasswordMail extends MailBase {

    user = {};

    constructor()
    {
        super();
    }

    async handle (user, code, request) {
        this.data.header = "Recuperación de Cuenta";
        this.support = request._system && request._system.support_email;
        this.data.support = request._system && request._system.support_email;
        this.data.image = request._system && request._system.image;
        this.data.username = user.email;
        this.data.contenido = `Código de Recuperación: <b>${code}<b>`
        this.data.btn = null;
        this.data.link = null;
        // enviar email
        await this.send((message) => {
            message.to(user.email)
                .subject(`Hola ${user.username}, Recuperación de Cuenta`);
        });
    }

}

module.exports = new RecoveryPasswordMail;