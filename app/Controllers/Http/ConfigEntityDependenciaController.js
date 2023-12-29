'use strict'

const { validate } = use('Validator');
const { validation } = require('validator-error-adonis');
const ConfigEntityDependencia = use('App/Models/ConfigEntityDependencia');

class ConfigEntityDependenciaController {

    store = async ({ request }) => {
        await validation(validate, request.all(), {
            config_entity_id: "required",
            dependencia_id: "required"
        });
        // crear
        let config_entity_dependencia = await ConfigEntityDependencia.create({ 
            config_entity_id: request.input('config_entity_id'),
            dependencia_id: request.input('dependencia_id')
        });
        // response  
        return {
            success: true,
            status: 201,
            message: `La configuración se guardo correctamente`,
            config_entity_dependencia
        }
    }

    destroy = async ({ params, request }) => {
        // get config
        let config_entity_dependencia = await ConfigEntityDependencia.find(params.id);
        if (!config_entity_dependencia) throw new Error("No se encontró la configuración de la entidad");
        // guardar
        await config_entity_dependencia.delete();
        // response
        return {
            success: true,
            status: 201,
            message: "La configuración se eliminó correctamente",
            config_entity_dependencia
        }
    }

}

module.exports = ConfigEntityDependenciaController
