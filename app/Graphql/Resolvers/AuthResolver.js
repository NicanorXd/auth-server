'use strict'

const Token = use('App/Models/Token')
const User = use('App/Models/User')
const Hash = use('Hash')
const Perfil = use('App/Models/Profile')
const Sistema = use('App/Models/System')
const Persona = use('App/Models/Person');
const AuthService = require('../../Services/AuthService');

class AuthResolver
{

    async login(root, { email, password }, { auth, request }) {
        
        try {
            
            let sistemas;
            // verificación y validacion de la cuenta
            const user = await User.findBy('email', email)
            // verifica si el usuario no existe!
            if (user == null) throw new Error("La cuenta de usuario no existe!");
            // verifica si la contraseña es incorrecta!
            if (!await Hash.verify(password, user.password)) throw new Error("La contraseña es incorrecta");
            // verifica si la cuenta no esta verificada
            if (user.token_verification) throw new Error("La cuenta no está verificada!");
            // verifica si el usuario esta desactivado
            if (!user.state) throw new Error("La cuenta esta deshabilitada");
            // obtenemos todas las sesiones abiertas del usuario
            const userCountToken = await Token.query().where('user_id', user.id).where('is_revoked', 0).getCount();
            // verificamos si el usuario ya pasó el limite de sesiones
            if (userCountToken == 5) throw new Error("Esta cuenta ya superó el límite de sesiones!");
            // generar token del usuario autenticado
            const { token, type } = await auth.generate(user)
            // obtener información del headers
            const user_agent = request.headers()['user-agent'];
            const { host } = request.headers();
            // guardar el token
            await Token.create({
                user_id: user.id,
                token,
                type,
                user_agent,
                host,
                is_revoked: 0
            });

            if (user.except == 0) {
                // recuperar los sistemas del usuario
                let perfiles = (await Perfil.query().where('user_id', user.id).fetch()).toJSON();
                let sistemaId = await perfiles.filter(e => e.sistema_id);
                let moduloId = await perfiles.filter(e => e.modulo_id);
                let metodoId = await perfiles.filter(e => e.metodo_id);

                // devolver menu de sistemas
                sistemas = await Sistema.query()
                    .with('modulos', (builder) => {
                        builder.whereIn("id", moduloId)
                            .with('metodos', (buildMetodo) => {
                                buildMetodo.whereIn('id', metodoId);
                            });
                    }).whereIn('id', sistemaId).fetch();

            } else {
                // devolver todos los sistemas al usuario excepcional
                sistemas = await Sistema.query().with('modulos', (builder) => {
                    builder.with('metodos');
                }).fetch();
            }
            
            // enviar objeto de respuesta
            return {
                code: "201",
                success: true,
                message: token,
                sistemas: sistemas.toJSON()
            }

       } catch (error) {
           return {
               success: false,
               code: "401",
               message: error.message
           } 
       }
    }


    async verifyAcount(root, { token_verification }, { auth }) {
        try {
            const user = await User.findBy("token_verification", token_verification);

            if (user == null) return {
                code: "401",
                success: false,
                message: "El token de verificación ya expiró!"
            }

            user.token_verification = "";
            user.save();

            // iniciar sesión automaticamente
            return new AuthResolver().login(root, { email: user.email, password: user.password }, { auth });
        } catch (error) {
            return {
                code: "501",
                success: false,
                message: "Algo salió mal, vuelva más tarde"
            }
        }
    }
    

    async authorize(root, { metodo }) {
        return AuthService.verifyClient(metodo).then(res => {
            return {
                code: "201",
                success: true,
                message: "El usuario está autorizado!"
            }
        }).catch(err => {
            return {
                code: "401",
                success: false,
                message: "El usuario no está autorizado"
            }
        });
    }


    async recoveryPassword(root, { email }) {
        try {
            const user = await User.findBy("email", email);
            // validar email
            if (user == null) return {
                code: "401",
                success: false,
                message: "El usuario no existe!"
            }

            user.reset_password = await Hash.make(user.email);
            user.save();

            return {
                code: "201",
                success: true,
                message: "Se le envió el codigo de recuperación a su correo electrónico"
            }
        } catch (error) {
            return {
                code: "501",
                success: false,
                message: "No se pudó enviar el codigo de recuperación a su correo electrónico"
            }
        }
    }   


    async resetPassword(root, { reset_password, new_password }) {
        try {
            const user = await User.findBy("reset_password", reset_password)

            if (user == null) return {
                code: "401",
                success: false,
                message: "El código de verificación ya expiró"
            }

            user.password = new_password;
            user.reset_password = "";
            user.save();

            // eliminar todos los tokens de la sesión
            await Token.query().where("user_id", user.id).delete();
            // retornar mensaje
            return {
                code: "201",
                success: true,
                message: "La contraseña se restauró correctamente!"
            }
        } catch (error) {
            return {
                code: "501",
                success: false,
                message: error.message
            }
        }
    }


    async changePassword(root, { old_password, new_password }, { auth, request }) {
        return AuthService.verify(auth, request, "changePassword").then(async res => {
            let { user } = res;

            const isSame = await Hash.verify(old_password, user.password);

            if (!isSame) return {
                code: "401",
                success: false,
                message: "La contraseña es incorrecta!"
            }

            // cambiar contraseña
            user.password = new_password;
            user.save()

            return {
                code: "201",
                success: true,
                message: "La contraseña se recuperó correctamente!"
            }
        }).catch(err => {
            return {
                code: "501",
                success: false,
                message: err.message
            }
        });
    }


    async logout(root,  { token }) {
        try {
            const is_token = await Token.query()
                .where("is_revoked", 0)
                .where("token", token)
                .first();

            if (!is_token) {
                throw new Error("No se pudó cerrar la sesión!");
            }   

            is_token.is_revoked = true;
            is_token.save();

            return {
                success:  true,
                message: "La sesión fué cerrada correctamente", 
                code: '201'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                code: '501'
            };
        }
    }


    async getAuth(root, args, { auth, request }) {
        return AuthService.verify(auth, request, "getAuth").then(async res => {
            let { user } = res;
            let persona = await Persona.find(user.persona_id);
            user.persona = persona.toJSON();
            return user.toJSON();
        }).catch(err => {
            throw Error(err.message);
        });
    }


    async getAuthPerfiles(root, args, { auth, request }) {
        return AuthService.verify(auth, request, "getAuth").then(async res => {
            let { user } = res;
            let sistemas;
            if (user.except == 0) {
                // recuperar los sistemas del usuario
                let perfiles = (await Perfil.query().where('user_id', user.id).fetch()).toJSON();
                let sistemaId = await perfiles.filter(e => e.sistema_id);
                let moduloId = await perfiles.filter(e => e.modulo_id);
                let metodoId = await perfiles.filter(e => e.metodo_id);

                // devolver menu de sistemas
                sistemas = await Sistema.query()
                    .with('modulos', (builder) => {
                        builder.whereIn("id", moduloId)
                            .with('metodos', (buildMetodo) => {
                                buildMetodo.whereIn('id', metodoId);
                            });
                    }).whereIn('id', sistemaId).fetch();

            } else {
                // devolver todos los sistemas al usuario excepcional
                sistemas = await Sistema.query().with('modulos', (builder) => {
                    builder.with('metodos');
                }).fetch();
            }

            return sistemas.toJSON();
        }).catch(err => {
            throw Error(err.message);
        });
    }
}


module.exports = new AuthResolver()
