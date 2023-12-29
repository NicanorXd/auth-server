const Mail = use('Mail');
const Env = use('Env');
const Config = use('Config')


class MailBase {

    email = "";
    name = "";
    support = "";
    view = "emails.emailBase";
    system = {};
    data = {
        header: "Bienvenido!!!",
        username: "twd2206@gmail.com",
        contenido: "Todo listo",
        btn: "Ir",
        date: new Date().getFullYear(),
        link: "#",
        support: "",
        image: ""
    };

    constructor() {
        this.email = Env.get('MAIL_FROM', 'twd2206@gmail.com');
        this.support = this.data.support || Env.get('APP_SUPPORT');
        this.name = Env.get('MAIL_NAME', 'Hans Medina');
    }

    /**
     * Enviar email
     * @param {*} callback 
     */
    send = async (callback = null) => {
        this.data._app = Env.get('MAIL_NAME', 'Authentication');
        // config dinamico del email
        if (this.system && this.system.config_mail_data) {
            Config.set('mail.connection', this.system.config_mail_connection);
            Config.set(`mail.${this.system.config_mail_connection}`, JSON.parse(this.system.config_mail_data || "{}"));
        }
        // enviar email
        await Mail.send(this.view, this.data, (message) => {
            message.from(this.email, this.name);
            // pasar callback
            if (typeof callback == 'function') callback(message);
        });
    }

}

module.exports = MailBase;