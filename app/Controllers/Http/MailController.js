'use strict'

const { validate } = use('Validator');
const ValidatorException = use('App/Exceptions/ValidatorException');
const MailBase = require('../../Mails/MailBase');
const System = use('App/Models/System');
const Env = use('Env');

class MailController {

    to = async ({ request }) => {
        // payload validation
        let validation = await validate(request.all(), { 
            from: "required|email",
            email : "required|email",
            header: "required|max:200",
            username: "required|max:50",
            contenido: "required|max:1000",
            subject: "required|max:100",
            reply_to: "email",
            link: 'url'
        });
        // validar request
        if (validation.fails()) throw new ValidatorException(validation.messages())
        // procesar
        try {
            // obtener request
            let { from, email, header, username, contenido, btn, link, subject, reply_to, params } = request.all();
            // obtener sistema
            let system = await System.query().where('email', from).first()
            // validar cuenta
            if (!system) throw new Error('El email del sistema no es valido!');
            await system.getUrlImage();
            // config mail 
            let mail = new MailBase;
            mail.email =  system.email;
            mail.name = system.name;
            mail.data.header = header;
            mail.data.username = username;
            mail.data.contenido = contenido;
            mail.data.btn = btn || null;
            mail.data.link = link ? `${Env.get('APP_URL')}/redirect?url=${link}` :  null;
            mail.data.support = system.support_email
            mail.data.image = system.image
            mail.system = system;
            await mail.send((m) => {
                m.to(email)
                m.subject(subject)
                reply_to ? m.replyTo(reply_to) : null;
            });
            // response
            return {
                success: true,
                code: 201,
                message: `Mail enviado a ${email} correctamente!`
            }
        } catch (error) {
            return {
                success: false,
                code: error.status,
                message: error.message
            };
        }
    }

}

module.exports = MailController
