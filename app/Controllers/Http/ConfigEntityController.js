'use strict'

const ConfigEntity = use('App/Models/ConfigEntity');
const { validate } = use('Validator');
const { validation } = require('validator-error-adonis');


class ConfigEntityController {

    store = async ({ request }) => {
        await validation(validate, request.all(), {
            entity_id: 'required',
            user_id: 'required'
        });
        // guardar
        let config_entity = await ConfigEntity.create({ 
            entity_id: request.input('entity_id'),
            user_id: request.input('user_id')
        });
        // response
        return {
            success: true,
            status: 201,
            message: "La configuación se agrego correctamente",
            config_entity
        }
    }

    destroy = async ({ params, request }) => {
        // get config
        let config_entity = await ConfigEntity.find(params.id);
        if (!config_entity) throw new Error("No se encontró la configuración de la entidad");
        // guardar
        await config_entity.delete();
        // response
        return {
            success: true,
            status: 201,
            message: "La configuración se eliminó correctamente",
            config_entity
        }
    }

}

module.exports = ConfigEntityController
