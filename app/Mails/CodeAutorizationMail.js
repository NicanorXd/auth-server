const MailBase = require('./MailBase');
const Env = use('Env');

class CodeAuthorizationMail extends MailBase {

    user = {};

    constructor()
    {
        super();
    }

    async handle (request, person, auth, autorization) {
        this.data.header = "Código de Autorización";
        this.support = request._system && request._system.support_email;
        this.data.support = request._system && request._system.support_email;
        this.data.image = auth.image;
        this.data.username = autorization.code;
        this.data.contenido = `
            ${auth.email} necesita su autorización para: <br/>
            <b>${autorization.description}</b> <br/> <br/>
            <small>el código de autorización es valido hasta ${autorization.expiration_at}</small><br/>
            <small>No comparta con cualquier persona su código de autorización</small>
        `
        this.data.btn = null;
        this.data.link = null;
        // enviar email
        await this.send((message) => {
            message.to(person.email_contact)
                .subject(`Hola ${person.name.toLowerCase()}, ${auth.email} necesita su autorización`);
        });
    }

}

module.exports = new CodeAuthorizationMail;