'use strict'

const User = use('App/Models/User');
const Token = use('App/Models/Token');
const { validateAll } = use('Validator');
const Encryption = use('Encryption');
const Permission = use('App/Models/Permission');
const { validation, ValidatorError } = require('validator-error-adonis');
const CustomException = require('../../../Exceptions/CustomException')

class LoginController {

    /**
     *  autenticar usuarios
     */
    login = async ({ request, auth, response }) => {
        // reglas de validacion
        await validation(validateAll, request.all(), {
            email: "required",
            password: "required|min:6"
        });
        // obtenemos los parametros
        let { email, password } = request.all();
        // obtenemos al usuario
        let user = await User.query()
            .where('email', email)
            .orWhere('username', email)
            .first();
        // verificamos si exise el usuario
        if (!user) throw new ValidatorError([{ field: 'email', message: 'No se encontró el usuario' }]);
        // verifica si la contraseña es incorrecta!
        let passDecrypt = await Encryption.decrypt(user.password);
        if (await passDecrypt != password) throw new ValidatorError([{ field: 'password', message: 'La contraseña es incorrecta' }]);
        // verifica si la cuenta no esta verificada
        if (user.token_verification) throw new CustomException("La cuenta no está verificada!", 'AUTH_VERIFICATION', 401);
        // verifica si el usuario esta desactivado
        if (user.state == 0) throw new CustomException("La cuenta esta deshabilitada", 'ACCOUNT_DISABLED', 401);
        // obtenemos todas las sesiones abiertas del usuario
        const userCountToken = 0;
        // verificamos si el usuario ya pasó el limite de sesiones
        if (userCountToken == 5) throw new Error("Esta cuenta ya superó el límite de sesiones!");
        // generar token del usuario autenticado
        const { token, type } = await auth.generate(user)
        // obtener información del headers
        const user_agent = request.headers()['user-agent'].toLowerCase();
        // crear device
        let device = 'Unknow';
        // devices disponibles
        let devices = [
            { key: "win", name: "Windows" },
            { key: "linux", name: "Linux" },
            { key: 'android', name: "Android"},
            { key: "mac", name: "Macintoch" },
            { key: "iphone", name: "Iphone" }
        ];
        // actualizar device
        await devices.filter(dev => device = user_agent.indexOf(dev.key) != -1 ? dev.name : device );
        // verificamos si el usuario no es excepto
        if (!user.except) {
            // obtenemos los perfiles
            let countPerfiles = await Permission.query().where('user_id', user.id).getCount();
            // verificamos si no tiene perfiles
            if (countPerfiles == 0) throw new CustomException('La cuenta no tiene accesso a los módulos', 'MODULE', 401);
        }
        // guardar el token
        await Token.create({
            user_id: user.id,
            token,
            type,
            user_agent,
            device,
            ip: request.ip(),
            is_revoked: 0
        });
        // devolvemos el token
        return {
            success: true,
            code: "201",
            message: "El usuario se autorizo correctamente!",
            token
        };
    }

}

module.exports = LoginController
