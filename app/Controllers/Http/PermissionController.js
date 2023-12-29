'use strict'

const Permission = use('App/Models/Permission');
const { validate } = use('Validator');
const ValidatorException = use('App/Exceptions/ValidatorException');
const DB = use('Database');

class PermissionController {

    index = async ({ request }) => {
        let { query_search, page } = request.all();
        let permissions = Permission.query()
            .join('users as u', 'u.id', 'permissions.user_id')
            .join('modules as m', 'm.id', 'permissions.module_id')
            .join('systems as sys', 'sys.id', 'm.system_id')
            .select('permissions.id', 'sys.name as system', 'm.name as module', 'u.username', 'u.email', 'u.id as user_id')
            .orderBy('sys.id', 'ASC')
            .orderBy('u.email', 'ASC');
        // filtros
        if (query_search)  permissions.whereRaw(`u.email like '%${query_search}%' OR u.username like '%${query_search}%'`)
        // pagintate
        permissions = await permissions.paginate(page || 1, 20);    
        // response
        return permissions.toJSON();
    }

    store = async ({ request }) => {
        // validar
        let validation = await validate(request.all(), {
            user_id : "required",
            module_id : "required"
        });
        //verificar errores 
        if (validation.fails()) throw new ValidatorException(validation.messages())
        // procesar
        try {
            try {
                // payload
                let payload = {
                    user_id: request.input('user_id'),
                    module_id: request.input('module_id'),
                    observation: request.input('observation', null)
                };
                // guardar los datos
                let permission = await Permission.create(payload);
                // response
                return {
                    success: true,
                    code: 201,
                    message: "El permiso se asigno correctamente!",
                    permission: permission
                }
            } catch (error) { throw new Error('No se pudo asignar el permiso') }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

    destroy = async ({ params, request }) => {
        try {
            let { id } = params;
            // obtener permiso
            let permiso = await Permission.find(id);
            await permiso.delete();
            // response 
            return {
                success: true,
                code: 201,
                message: "El permiso fué eliminado correctamente!"
            }
        } catch (error) {
            return {
                success: false,
                code: 401,
                message: error.message
            }
        }
    }
}

module.exports = PermissionController
