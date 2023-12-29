'use strict'

const Module = use('App/Models/Module');
const { validateAll } = use('Validator');
const { validation } = require('validator-error-adonis');
const slugify = require('slugify');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')

class ModuleController {

    store = async ({ request }) => {
        await validation(validateAll, request.all(), {
            name: 'required|max:40',
            description: 'required|max:100',
            system_id: 'required'
        })
        // generar alias 
        let alias = `${slugify(request.input('name'))}`.toUpperCase();
        // guardar
        let module = await Module.create({
            name: request.input('name'),
            alias,
            description: request.input('description'),
            system_id: request.input('system_id')
        });          
        // response 
        return {
            success: true,
            code: 201,
            message: "El modulo se guardo correctamente!",
            module,
        }
    }

    update = async ({ params, request }) => {
        let module = await Module.find(params.id);
        if (!module) throw new NotFoundModelException('No se encontró el modulo');
        // validar
        await validation(validateAll, request.all(), {
            name: 'required|max:40',
            alias: 'required|max:40',
            description: 'required|max:100'
        });
        // guardar
        module.merge({
            name: request.input('name'),
            description: request.input('description'),         
            alias: request.input('alias'),
        })
        await module.save();
        // response 
        return {
            success: true,
            code: 201,
            message: "El modulo se actualizo correctamente!"
        }
    }

    delete = async ({ params, request }) => {
        let module = await Module.find(params.id);
        if (!module) throw new NotFoundModelException('No se encontró el modulo');
        await module.delete();
        // response 
        return {
            success: true,
            code: 201,
            message: "El modulo se eliminó correctamente!"
        }
    }
}

module.exports = ModuleController
