const MailBase = require('./MailBase');
const Env = use('Env');

class VerifyAccount extends MailBase {

    constructor()
    {
        super();
    }

    async handle (user, redirect = "") {
        this.data.header = "Verificación de Cuenta";
        this.data.username = user.email;
        this.data.contenido = `Porfavor haga click en el boton de verificar cuenta.`
        this.data.btn = `Verificar Cuenta`;
        this.data.link = `${Env.get('APP_URL')}/verify_account?email=${user.email}&code=${user.token_verification}&redirect=${redirect}`;
        // enviar email
        await this.send((message) => {
            message.to(user.email)
                .subject(`Hola ${user.username}, Verifica tu cuenta`);
        });
    }

}

module.exports = new VerifyAccount;