'use strict'

const User = use('App/Models/User');
const { validate } = use('Validator');
const Encryption = use('Encryption');
const Event = use('Event');
const Random = require('random');
const Env = use('Env');
const ValidatorException = use('App/Exceptions/ValidatorException');

class RegisterController {

    /**
     * registrar usuarios
     */
    register = async ({ request, response }) => {
        // reglas de validacion
        let validation = await validate(request.all(), {
            username: "required",
            email: "required|email|unique:users,email",
            password: "required|max:100|min:8",
            person_id: "required"
        });
        // validamos el request
        if (validation.fails()) throw new ValidatorException(validation.messages());
        // procesar
        try {
            let { email, username, redirect } = request.all();
            // generar codigo de verificacion
            let code = Random.int(100000, 999999);
            // generar username
            username = username.split('@')[0];
            // preparar consulta
            let payload = {
                username: `${username}@${Env.get('APP_NAME', 'entidad')}`.toLowerCase(),
                email,
                password: request.input('password'),
                token_verification: Encryption.encrypt(code),
                person_id: request.input('person_id'),
                state: 1
            };
            // guardarmos el registro
            let newUser = await User.create(payload);
            // enviar email de bienvenida
            Event.fire('user::registered', newUser, redirect);
            // response
            return {
                success: true,
                code: 201,
                message: "El usuario se creó correctamente!",
                data: newUser
            }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            };
        }
    }

}

module.exports = RegisterController
