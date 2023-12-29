'use strict';

const Metodo = use('App/Models/Method')
const Token = use('App/Models/Token')
const Perfil = use('App/Models/Profile')

class AuthService
{

    verify(auth, request, nombre) {
        return new Promise( async (resolve, reject) => {
            try {

                let perfil = null; 
                await auth.check()
                const user = await auth.getUser();
                const { authorization } = request.headers();
                const current_token = this.gerToken(authorization); 
                const metodo = await Metodo.findBy('nombre', nombre);
                const is_token = await Token.findBy("token", current_token.token);

                // validar el token
                if (is_token == null) {
                    throw new Error("El token ha expirado");
                }

                // verificar suspencion de la sesión
                if (is_token.is_revoked == 1) {
                    throw new Error("La sesión ya expiró");
                }

                // verificando el metodo
                if (metodo == null) {
                    throw new Error("El metodo no está registrado!");
                }

                // verificamos que el usuario no sea un usuario excepcional
                if (user.except == 0) {
                    // si el usuario no tiene acesso creara un error
                    perfil = await Perfil.query().where("metodo_id", metodo.id).where("user_id", user.id).first()
    
                    if (perfil == null) {
                        throw new Error("Usuario no autorizado");
                    }

                };

                resolve({ user, metodo, perfil, auth });
            } catch (error) {
                reject(error);
            }
        })
    }

    verifyClient(metodo, request) {
        return new Promise( async (resolve, reject) => {
            try {

                let perfil = null;
                await auth.check()
                const { authorization } = request.headers();
                const current_token = this.gerToken(authorization); 
                const is_token = await Token.where('is_revoked', 0).with('user').findBy("token", current_token.token);
                const isMetodo = await Metodo.findBy("nombre", metodo);

                if (is_token == null) {
                    throw new Error("El token ha expírado");
                }

                if (isMetodo == null) {
                    throw new Error("El sistema no está permitido");
                }

                // obtenemos el campo de except
                const { except } = is_token.user;
                // verificamos que el usuario no sea excepcional
                if (except == 0) {
                    perfil = await Perfil.query().with('metodo')
                        .where("user_id", is_token.user_id)
                        .where("metodo_id", isMetodo.id)
                        .first();
                    // verificamos que el usuario este permitido al metodo
                    if (!perfil) {
                        throw new Error("El usuario no está permitido");
                    }

                }
                
                resolve({ perfil, is_token, sistema });
            } catch (error) {
                reject(error);
            }
        })
    }

    gerToken(bearer = "") {
        const parse = bearer.split(" ");
        return {
            type: parse[0],
            token: parse[1]
        }
    }

}

module.exports = new AuthService;