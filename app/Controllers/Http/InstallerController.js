'use strict'

const System = use('App/Models/System');
const { validation } = require('validator-error-adonis');
const Method = use('App/Models/Method');
const collect = require('collect.js');
const Logger = use('Logger')

class InstallerController {

    handle = async ({ request }) => {
        let systemSecret = request.header('SystemSecret');
        if (!systemSecret) throw new Error("La cabezera SystemSecret es requerida!");
        // validar storage
        await validation(null, request.all(), {
            name: "required|max:255",
            description: "required|max:255",
            url: "required",
            action_type: "required"
        });
        // obtener metodos de cliente
        let storage = collect(request.collect(['name', 'description', 'url', 'action_type']));
        // registrar métodos
        return await this.register(systemSecret, storage);
    }

    register = async (systemSecret, storage = []) => {
        let system = await System.findBy('token', systemSecret);
        if (!system) throw new Error('El Sistema no se encuentra registrado!');
        // obtener methodos instalados
        let methods = await Method.query()
            .where('system_id', system.id)
            .fetch();
        methods = collect(await methods.toJSON());
        let creator = collect([]);
        // actualizar methodos existentes
        for (let store of storage) {
            let method = methods.where('name', `${store.name}`).first() || null;
            if (method) {
                // generar payload
                let payload = {};
                // verificar cambios
                payload = await this.verifyChange(method, store, ["description", "url", "action_type"]);
                // validar actualización
                if (Object.keys(payload).length) {
                    await Method.query()
                        .where('id', method.id)
                        .update({ ...payload, state: 1 });
                    // message updating
                    Logger.info(`updated: ${method.name}`);
                }
                // next update
                continue;
            }
            // add system id
            store.system_id = system.id;
            // add
            creator.push(store);
        }
        // crear
        if (creator.count()) await Method.createMany(creator.toArray());
        // response
        return {
            success: true,
            status: 201,
            message: "Los métodos se instalarón correctamente!"
        };
    }

    verifyChange = async (object, newObject, attributes = []) => {
        let response = {};
        // verificar
        for(let attribute of attributes) {
            if (newObject[attribute] && object[attribute] != newObject[attribute]) {
                response[attribute] = newObject[attribute];
            }
        }
        // reponse
        return response;
    }
}

module.exports = InstallerController
