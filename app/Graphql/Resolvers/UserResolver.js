'use strict'

const User = use('App/Models/User')
const Persona = use('App/Models/Person')
const Perfil = use('App/Models/Profile')
const AuthService = require('../../Services/AuthService')
const Hash = use('Hash')
const Event = use('Event')
const slugify = require('slugify');

class UserResolver
{

    async getUsers(root, { like, page }, { auth, request}) {
        return await AuthService.verify(auth, request, "getUsers").then(async res => {
            let users = User.query().with('persona')
            
            if (like) {
                users = users.where('email', 'like', `%${like}%`);
            }

            users = await users.paginate(page, 30);
            return users.toJSON();
        }).catch(err => {
            throw new Error(err.message)
        });
    }


    async createUser(root, { username, email, password, persona_id }) {
        try {
            const persona = await Persona.find(persona_id)
            const verification = await Hash.make(email);

            if (persona == null) {
                throw new Error('La persona no existe dentro de la applicación');
            }

            const newUser = await User.create({
                username: slugify(`${username}@unu`),
                email,
                password,
                token_verification: verification,
                persona_id
            });

            Event.fire('new::user', newUser)

            return "Se le envió un token de verificación a su correo electrónico";
        } catch (error) {
            throw new Error(error.message)
        }
    }


    async assignMetodos(root, { metodo_ids }, { auth, request }) {
        return await AuthService.verify(auth, request, "assignMetodos").then(async res => {
            let { user } = res;
            let payload = [];
            // obtenemos los perfiles del usuario autenticado
            const perfiles = await Perfil.query().where('user_id', user.id).fetch();
            let isPerfil = true;
            // configurar
            for(let m of metodo_ids) {
                for(let perfil of perfiles.toJSON()) {
                    isPerfil = true; 
                    if (m == perfil.metodo_id) {
                        isPerfil = false;
                        break;
                    }
                }

                if (isPerfil) {
                    payload.push({
                        metodo_id: m,
                        user_id: user.id
                    });
                }

            }
            
            await Perfil.createMany(payload);

            return {
                code: "201",
                success: true,
                message: "Se asigno los perfiles correctamente!"
            }
        }).catch(err => {
            return {
                code: "401",
                success: false,
                message: err.message
            }
        });
    }

}


module.exports = new UserResolver