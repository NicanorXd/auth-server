'use strict'

const Person = use('App/Models/Person');
const { validate } = use('Validator');
const { validation, ValidatorError } = require('validator-error-adonis');
const CodeAuthorization = use('App/Models/CodeAuthorization');
const uid = require('uid');
const moment = require('moment');
const Event = use('Event');

class CodeAuthorizationController {

    generate = async ({ params, request }) => {
        try {
            // validar description
            await validation(validate, request.all(), {
                description: "required|min:3|max:255"
            });
            // obtener persona
            let person = await Person.find(params.person_id || '__error');
            if (!person) throw new Error("La persona no existe en el sistema");
            // validar correo de contacto
            if (!person.email_contact) throw new Error("La persona no tiene correo electrónico");
            // obtener token
            let token = request.$token;
            let auth = request.$user;
            // generar tiempo limite
            let now = moment();
            let five_min = '00:05:00';
            await now.add(moment.duration(five_min));
            // generar tansaccion
            let payload = {
                code: `${await uid(10)}`.toUpperCase(),
                description: request.input('description'),
                expiration_at: now.format('YYYY-MM-DD hh:mm:ss'),
                person_id: person.id,
                token_id: token.id
            };
            // revocamos códigos no autorizados
            await CodeAuthorization.query()
                .where('person_id', person.id)
                .where('is_authorize', 0)
                .update({ is_revoked: 1 });
            // creamos código de autorización
            let code_authorization = await CodeAuthorization.create(payload);
            // ejecutar evento
            Event.fire('person::codeAuthorization', request, person, auth, code_authorization);
            // response
            return {
                success: true,
                message: "El código de autorización se genero correctamente!",
                status: 201
            }
        } catch (err) {
            return {
                success: false,
                message: err.message || 'No se pudo generar el código de autorización',
                status: err.status || 501
            };
        }
    }

    validate = async ({ params, request }) => {
        try {
            // validar code
            await validation(validate, request.all(), {
                code: "required|min:10|max:10"
            });
            // obtener persona
            let person = await Person.find(params.person_id || '__error');
            if (!person) throw new Error("La persona no existe en el sistema");
            // obtener codigo
            let code_authorization = await CodeAuthorization.query()
                .where('person_id', person.id)
                .where('is_revoked', 0)
                .where('is_authorize', 0)
                .where('code', request.input('code'))
                .first();
            if (!code_authorization) throw new ValidatorError([ { field: 'code', message: "El código de autorización es invalido" } ]);
            // validar fecha de expiración
            let now = await moment(moment().format('YYYY-MM-DD hh:mm:ss'));
            let expiration = await moment(moment(code_authorization.expiration_at).format('YYYY-MM-DD hh:mm:ss'));
            // comparar fecha de expiracion
            if (now > expiration) {
                code_authorization.is_revoked = 1;
                await code_authorization.save();
                throw new ValidatorError([ { field: 'code', message: "El código de autorización ya expiro" } ]);
            }
            // código autorizado
            code_authorization.is_authorize = 1;
            await code_authorization.save();
            // obtener las imagenes
            await person.getUrlImage()
            // revelar datos 
            let payload = {
                password_signatured: await person.getPasswordSignatured(),
                image_images: person.image_images
            };
            // response
            return {
                success: true,
                message: "El código fue validado correctamente!",
                status: 201,
                datos: payload
            }
        } catch (err) {
            return {
                success: false,
                message: err.message || 'No se pudo validar el código de autenticación',
                status: err.status || 501
            };
        }
    }

}

module.exports = CodeAuthorizationController
