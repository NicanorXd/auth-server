const MailBase = require('./MailBase');
const Encryption = use('Encryption');

class ChangedDataMail extends MailBase {

    constructor()
    {
        super();
    }

    async handle (system, user) {
        this.system = system;
        this.data.header = `Actualización exitosa`;
        this.data.username = user.email;
        this.data.contenido = `Sus nuevas credenciales de acceso al sistema son: <br/>
            Email: <b>${user.email}</b> <br/>
            Password: <b>${Encryption.decrypt(user.password)}</b>
        `
        this.data.btn = null;
        this.data.link = null;
        this.data.image = system.image;
        // enviar email
        await this.send((message) => {
            message.to(user.email)
                .subject(`Hola ${user.username}, se actualizarón tus datos`);
        });
    }

}

module.exports = new ChangedDataMail;