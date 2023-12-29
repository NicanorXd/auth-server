'use strict'

const User = use('App/Models/User');
const Token = use('App/Models/Token');
const { validateAll } = use('Validator');
const Encryption = use('Encryption');
const Event = use('Event');
const { validation, ValidatorError } = require('validator-error-adonis');
const uid = require('uid');

class RecoveryPasswordController {

    /**
     * Recuperar cuenta
     * @param {*} root
     * @param {*} param1
     */
    recoveryPassword = async({ request }) => {
        let { email } = request.all();
        const user = await User.findBy("email", email || "");
        // validar usuario
        if (user == null) throw new ValidatorError([{ field: 'email', message : 'el usuario no existe!' }]);
        try {
            // generar codigo de recuperacion de contraseña
            let raw_code = `${await uid(8)}`.toUpperCase();
            let code = Encryption.encrypt(raw_code);
            user.reset_password = code;
            await user.save();
            // enviar email
            Event.fire('user::recoveryPassword', user, raw_code, request);
            // response
            return {
                code: "201",
                success: true,
                message: "Se le envió el codigo de recuperación a su correo electrónico"
            }
        } catch (error) {
            throw new Error("No se pudó enviar el codigo de recuperación a su correo electrónico");
        }
    }

    /**
     *
     * @param {*} root
     * @param {*} param1
     */
    resetPassword = async ({ request }) => {
        // reglas de validacion
        await validation(validateAll, request.all(), {
            email: "required|email",
            password: "required|confirmed|min:8|max:20",
            code: "required|min:8|max:8"
        });
        // datos
        let { email, password, code } = request.all();
        const user = await User.query()
            .where("email", email)
            .first();
        if (!user) throw new ValidatorError([{field: 'email', message: 'La cuenta de usuario no existe'}]);
        // validar code
        let raw_code = await Encryption.decrypt(user.reset_password);
        if (!raw_code == code) throw new ValidatorError([{field: 'code', message: 'El código es invalido!'}]);
        // reset password
        user.password = password;
        user.reset_password = null;
        await user.save();
        // eliminar todos los tokens de la sesión
        await Token.query().where("user_id", user.id).update({ is_revoked : 1 });
        // retornar mensaje
        return {
            code: "201",
            success: true,
            message: "La contraseña se restauro correctamente!"
        }
    }

}

module.exports = RecoveryPasswordController
