'use strict'

const Module = use('App/Models/Module');
const Method = use('App/Models/Method');
const System = use('App/Models/System');
const NotFoundModelException = require('../../../Exceptions/NotFoundModelException');
const CustomException = require('../../../Exceptions/CustomException');
const Collect = require('collect.js');
const { validation } = require('validator-error-adonis');

class AuthPermissionController {

    // filtrar por sistema
    handle = async ({ params, request }) => {
        let system = await System.findBy('alias', params.slug)
        if (!system) throw new NotFoundModelException("El sistema");
        // obtener módulos
        let modules = await Module.query()
            .join('config_modules as conf', 'conf.module_id', 'modules.id')
            .join('permissions as per', 'per.module_id', 'conf.module_id')
            .where('conf.app_id', request.$app.id)
            .where('per.user_id', request.$user.id)
            .where('modules.system_id', system.id)
            .select('conf.slug')
            .fetch();
        // parse module
        modules = modules.toJSON();
        modules = Collect(modules).pluck('slug').all();
        // get metodos
        let methods = await Method.query()
            .join('systems as s', 's.id', 'methods.system_id')
            .where('s.id', system.id)
            .where('methods.state', 1)
            .whereRaw(`
                NOT EXISTS (SELECT null FROM block_method_apps as b_app WHERE b_app.app_id = ${request.$app.id} AND b_app.method_id = methods.id)
                AND NOT EXISTS (SELECT null FROM block_method_users as b_user WHERE b_user.user_id = ${request.$user.id} AND b_user.method_id = methods.id)
            `)
            .select(`methods.name`)
            .fetch();
        // parse user
        methods = methods.toJSON();
        methods = Collect(methods).pluck('name').all();
        // response
        return {
            success: true,
            status: 201,
            modules,
            methods
        }
    }

    // filtrar por tipo
    type = async ({ params, request }) => {
        let allow = false;
        let system = await System.findBy('alias', params.slug)
        if (!system) throw new NotFoundModelException("El sistema");
        // validar name
        await validation(null, request.all(), {
            name: 'required'
        });
        // tipos
        let types = ['MODULE', 'METHOD'];
        if (!types.includes(params.type)) throw new CustomException("El tipo no está permitido");
        // verificar
        switch (params.type) {
            case 'MODULE':
                let module_count = await Module.query()
                    .join('config_modules as conf', 'conf.module_id', 'modules.id')
                    .join('permissions as per', 'per.module_id', 'conf.module_id')
                    .where('conf.app_id', request.$app.id)
                    .where('per.user_id', request.$user.id)
                    .where('modules.system_id', system.id)
                    .where('conf.slug', request.input('name'))
                    .select('conf.id')
                    .getCount();
                // setting allow
                allow = module_count ? true : false;
                break;
            default:
                let method_count = await Method.query()
                    .join('systems as s', 's.id', 'methods.system_id')
                    .where('s.id', system.id)
                    .where('methods.state', 1)
                    .where('methods.name', request.input('name'))
                    .whereRaw(`
                        NOT EXISTS (SELECT null FROM block_method_apps as b_app WHERE b_app.app_id = ${request.$app.id} AND b_app.method_id = methods.id)
                        AND NOT EXISTS (SELECT null FROM block_method_users as b_user WHERE b_user.user_id = ${request.$user.id} AND b_user.method_id = methods.id)
                    `)
                    .select(`methods.id`)
                    .getCount();
                    // setting allow
                    allow = method_count ? true : false;
                break;
        }
        // response
        return {
            success: true,
            status: 201,
            allow
        }
    } 

}

module.exports = AuthPermissionController
