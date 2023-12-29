const MailBase = require('./MailBase');

class AutoResetPasswordMail extends MailBase {

    constructor()
    {
        super();
    }

    async handle (user, password, request) {
        this.data.header = `Su contraseña ha sido auto-generada`;
        this.data.username = user.email;
        this.data.contenido = `El administrador auto-generó su contraseña:  <br/>
            Nueva contraseña: <b>${password}</b>
        `
        this.data.btn = null;
        this.data.link = null;
        this.data.support = request._system && request._system.support_email;
        this.data.image = request._system && request._system.image;
        // enviar email
        await this.send((message) => {
            message.to(user.email)
                .subject(`Hola ${user.username}, Su contraseña ha sido auto-generada`);
        });
    }

}

module.exports = new AutoResetPasswordMail;