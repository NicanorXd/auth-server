const MailBase = require('./MailBase');

class ChangedStateMail extends MailBase {

    constructor()
    {
        super();
    }

    async handle (user, request) {
        this.data.header = `Su cuenta ha sido ${user.state ? "restaurada" : "desactivada"}`;
        this.data.username = user.email;
        this.data.contenido = `El administrador ${user.state ? "restauró" : "desactivo"} tu cuenta.`
        this.data.btn = null;
        this.data.link = null;
        this.data.support = request._system && request._system.support_email;
        this.data.image = request._system && request._system.image;
        // enviar email
        await this.send((message) => {
            message.to(user.email)
                .subject(`Hola ${user.username}, Su cuenta ha sido ${user.state ? "restaurada" : "desactivada"}`);
        });
    }

}

module.exports = new ChangedStateMail;