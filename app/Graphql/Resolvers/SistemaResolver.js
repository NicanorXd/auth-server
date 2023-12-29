'use strict';

const Sistema = use('App/Models/System')
const AuthService = require('../../Services/AuthService');
const Event = use('Event')
const Hash = use('Hash')

class SistemaResolver
{

    async createSystem(root,  { input }, { auth, request }) {
        return await AuthService.verify(auth, request, "createSystem").then(async res => {
            const sistema = await Sistema.create({
                nombre: input.nombre,
                alias: input.alias,
                descripcion: input.descripcion,
                email: input.email,
                icono: input.icon,
                ruta: input.ruta,
                token: await Hash.make(input.email),
                version: input.version
            });

            Event.fire("new::sistema", sistema);

            return {
                code: "201",
                success: true,
                message: "El sistema se registro correctamente",
                sistema
            }
        }).catch(err => {
            return {
                code: "401",
                success: false,
                message: err.message,
                sistema: []
            }
        });
    }

}

module.exports = new SistemaResolver();