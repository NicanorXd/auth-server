'use strict'

const User = use('App/Models/User');
const { validateAll } = use('Validator');
const { validation } = require('validator-error-adonis');
const Event = use('Event');
const Random = require('random');
const CustomException = require('../../../Exceptions/CustomException')
const Encryption = use('Encryption');

class VerifyAccountController {


    /**
     * verificar cuenta del usuario creado
     */
    verifyAccount = async ({ request, response }) => {
        // regla de validación
        await validation(validateAll, request.all(), {
            email: "required|email",
            code: "required"
        });
        // payload
        let { email, code, redirect } = request.all();
        // obtener usuario
        let user = await User.findBy('email', email);
        // validar usuario
        if (!user) throw new CustomException('El usuario no existe!');
        // verificamos si la cuenta está verificada
        if (!user.token_verification) throw new CustomException('La cuenta ya está verificada!');
        // obtener código embebido
        let code_embed = await Encryption.decrypt(user.token_verification);
        let code_current = await Encryption.decrypt(`${code}`.replace(/[\s]+/g, "+"));
        // verificamos que el codigo sea erronéo
        if (code_embed != code_current) throw new CustomException("El codígo es incorrecto!");
        // cuenta verificada
        user.token_verification = null;
        await user.save();
        // validar el redirect
        if (redirect) return response.redirect(redirect);
        // response
        return {
            success: true,
            code: 201,
            message: "La cuenta fué verificada correctamente!"
        }
    }


    /**
     * reenviar codigo de verificación
     */
    resendVerificationCode = async ({ request, response }) => {
        try {
            // regla de validacion
            let validation = await validate(request.all(), {
                email: "required|email"
            });
            // validar
            if (validation.fails()) return {
                success: false,
                code: 401,
                errors: validation.messages()
            }
            // payload
            let { email } = request.all();
            // obtenemos al usuario
            let user = await User.findBy('email', email);
            // verificamos al usuario
            if (!user) throw new Error('El usuario no existe!');
            // verificamos si se puede verificar la cuenta
            if (!user.token_verification) throw new Error('La cuenta ya está verificada!');
            // generar codigo
            let code = Random.int(100000, 999999);
            // enviar codigo
            Event.fire('new::user', user, code);
            // response
            return {
                success: true,
                code: 201,
                message: "El codigo de verificación se envió correctamente!"
            }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

}

module.exports = VerifyAccountController
