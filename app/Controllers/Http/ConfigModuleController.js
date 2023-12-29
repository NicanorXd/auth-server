'use strict'

const ConfigModule = use('App/Models/ConfigModule');
const { validateAll } = use('Validator');
const { validation } = require('validator-error-adonis');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')

class ConfigModuleController {

    store = async ({ request }) => {
        await validation(validateAll, request.all(), {
            app_id: "required",
            module_id: 'required',
            icon: 'required|max:255',
            slug: 'required|max:255'
        });
        // guardar
        try {
            await ConfigModule.create({
                app_id: request.input('app_id'),
                module_id: request.input('module_id'),
                icon: request.input('icon'),
                slug: request.input('slug')
            });
            // response 
            return {
                success: true,
                code: 201,
                message: "Los datos se guardarón correctamente!"
            }
        } catch (error) {
            throw new Error("No se pudo guardar los datos");   
        }
    }

    update = async ({ params, request }) => {
        await validation(validateAll, request.all(), {
            icon: 'required',
            slug: 'required'
        });
        // obtener config
        let config = await ConfigModule.find(params.id);
        if (!config) throw new NotFoundModelException("Configuración de módulo");
        config.merge({ 
            icon: request.input('icon'),
            slug: request.input('slug')
        })
        // actualizar
        await config.save();
        // response
        return {
            success: true,
            status: 201,
            message: "La configuración fué actualizadad correctamente!",
            config
        }
    }

    delete = async ({ params, request }) => {
        let config = await ConfigModule.find(params.id);
        if (!config) throw new NotFoundModelException("Configuración de módulo");
        // eliminar
        await config.delete();
        // response
        return {
            success: true,
            status: 201,
            message: "La configuración del módulo se eliminó correctamente!"
        }
    }

}

module.exports = ConfigModuleController
