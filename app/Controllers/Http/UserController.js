'use strict'

const User = use('App/Models/User');
const Person = use('App/Models/Person');
const Token = use('App/Models/Token');
const Permission = use('App/Models/Permission');
const { URL, LINK_IMAGES } = require('../../../utils');
const Event = use('Event');
const Method = use('App/Models/Method');
const Entity = use('App/Models/Entity');
const Dependencia = use('App/Models/Dependencia')
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')
const { validation, ValidatorError } = require('validator-error-adonis');
const collect = require('collect.js');
const uid = require('uid');

class UserController {

    index = async ({ request, response }) => {
        let { query_search, state, page } = request.all();
        let ids = collect(request.collect(['ids'])).pluck('ids').toArray();
        let users = User.query()
            .with('person')
            .join('people as p', 'p.id', 'users.person_id')
            .where('users.state', state || 1)
        // filtro ids
        if (query_search) users.whereRaw(`(email like '%${query_search || ""}%' OR username like '%${query_search || ""}%' OR p.fullname like '%${query_search}%')`)
        if (ids.length) users.whereIn('users.id', ids)
        // paginatión
        users = await users.select('users.*')
           .paginate(page || 1, 20)
        // add imagen
        users = await users.toJSON();
        // response
        return {
            success: true,
            status: 201,
            users
        };
    }

    show = async ({ params, request }) => {
        let user = await User.find(params.id);
        if (!user) throw new NotFoundModelException("El usuario")
        user.person = await user.person().fetch();
        return {
            success: true,
            status: 201,
            user
        };
    }

    async update ({ params, request }) {
        let token = request.$token;
        let datos = request.only(['username', 'email', 'sync']);
        await validation(null, datos, {
            username: 'required|max:30',
            email: 'required|max:40|email'
        });
        // validar
        let user = await User.find(params.id);
        if (!user) throw new NotFoundModelException("el usuario");
        // validar username
        let is_username = await User.query()    
            .where('username', datos.username)
            .where('id', '<>', user.id)
            .getCount();
        if (is_username) throw new ValidatorError([{ field: 'username', message: `El username ya está en uso` }]);
        // validar email
        let is_email = await User.query()    
            .where('email', datos.email)
            .where('id', '<>', user.id)
            .getCount();
        if (is_email) throw new ValidatorError([{ field: 'email', message: `El email ya está en uso` }]);
        // actualizar datos
        user.merge({
            email: datos.email,
            username: datos.username     
        });
        // actualizar
        await user.save();
        // revocar token
        await Token.query()
            .where('id', '<>', token.id)
            .where('user_id', user.id)
            .update({ is_revoked: 1 });
        // sincronizar email con el de persona
        if (datos.sync) await Person.query()
            .where('id', user.person_id)
            .update({ email_contact: datos.email });
        // response
        return {
            success: true,
            status: 201,
            message: "El usuario se actualizó correctamente!"
        }
    }

    permissions = async ({ params }) => {
        let { id } = params;
        let permisions = await Permission.query()
            .join('users as u', 'u.id', 'permissions.user_id')
            .join('modules as m', 'm.id', 'permissions.module_id')
            .join('systems as sys', 'sys.id', 'm.system_id')
            .where('u.id', id)
            .select(
                'permissions.id', 'sys.name as system', 'm.name as module', 'u.username', 
                'u.email', 'u.id as user_id', 'sys.id as system_id', 'm.id as module_id'
            )
            .orderBy('sys.id', 'ASC')
            .fetch();
        // response
        return permisions || [];
    }

    /**
     * Cambiar el estado del usuario
     * @param {*} params
     * @param {*} request 
     */
    state = async ({ params, request }) => {
        try {
            let state = request.input('state') ? 1 : 0;
            // obtener usuario
            let user = await User.find(params.id);
            if (!user) throw new Error("No se encontró al usuario");
            // actualizar 
            user.state = state;
            await user.save();
            // emitir evento
            Event.fire('user::changedState', user, request);
            // response
            return {
                success: true,
                code: 201, 
                message: `La cuenta de "${user.email}" se ${state ? 'restauró' : 'desactivo'} correctamente!`
            }
        } catch (error) {
            return { 
                success: false,
                code: error.status,
                message: error.message
            }
        }
    }

    /**
     * Restricciones de la app
     * @param {*} param0 
     */
    block = async ({ params, request }) => {
        let { query_search, page, block } = request.all();
        let methods = Method.query()
            .join('systems as sys', 'sys.id', 'methods.system_id')
            .select('methods.*', 'sys.name as system')
            .orderBy('methods.system_id', 'ASC')
            .orderBy('methods.name')
        // filtro
        if (query_search) methods.whereRaw(`(methods.name LIKE '%${query_search}%' OR methods.url LIKE '%${query_search}%' OR sys.name LIKE '%${query_search}%')`);
        if (block == 1) methods.whereRaw(`EXISTS (SELECT null FROM block_method_users WHERE user_id = ${params.id} AND methods.id = method_id)`);
        else methods.whereRaw(`NOT EXISTS (SELECT null FROM block_method_users WHERE user_id = ${params.id} AND methods.id = method_id)`);
        // paginar
        methods = await methods.paginate(page || 1, 20);
        // response 
        return {
            success: true,
            status: 201,
            methods
        }
    }

    /**
     * obtener las entidades del usuario
     * @param {*} param0 
     */
    entity = async ({ params, request, response }) => {
        let { query_search, page } = request.all();
        let entities = Entity.query()
            .where('conf.user_id', '=', params.id)
            .join('config_entities as conf', 'entities.id', 'conf.entity_id')
            .select('entities.*', 'conf.id as config_entity_id')
        // get entities
        entities = await entities.paginate(page, 20);
        entities = entities.toJSON();
        // generar imagenes
        await entities.data.map(async ent => {
            ent.logo_images =  await LINK_IMAGES(ent.logo, 'logo');
            ent.logo = URL(ent.logo);
        });
        // response
        return {
            success: true,
            status: 201,
            entities
        }
    }

    /**
     * obtener las entidades donde no esta el usuario
     * @param {*} param0 
     */
    notEntity = async ({ params, request, response }) => {
        let { page } = request.all();
        let entities = Entity.query()
            .whereRaw(`
                NOT EXISTS (
                    SELECT null FROM config_entities as conf
                    WHERE conf.entity_id = entities.id  AND conf.user_id = ${params.id}
                )
            `)
            .select('entities.*')
        // get entities
        entities = await entities.paginate(page, 20);
        entities = entities.toJSON();
        // generar imagenes
        await entities.data.map(async ent => {
            ent.logo_images =  await LINK_IMAGES(ent.logo, 'logo');
            ent.logo = URL(ent.logo);
        });
        // response
        return {
            success: true,
            status: 201,
            entities
        }
    }


    /**
     * obtener las dependencias del usuario
     * @param {*} param0 
     */
    dependencia = async ({ params, request, response }) => {
        let { page, except } = request.all();
        except = except ? true : false;
        let dependencia = Dependencia.query();
        if (except) {
            dependencia.whereRaw(`
                NOT EXISTS (
                    SELECT null FROM config_entities as conf 
                    INNER JOIN config_entity_dependencias as conf_dep ON conf_dep.config_entity_id = conf.id
                    WHERE conf.entity_id = ${params.entity_id} AND conf.user_id = ${params.id} AND conf_dep.dependencia_id = dependencias.id
                )
            `)
        .select('dependencias.*')
        }  else {
            dependencia.join('config_entity_dependencias as conf_dep', 'conf_dep.dependencia_id', 'dependencias.id')
                .join('config_entities as conf', 'conf.id', 'conf_dep.config_entity_id')
                .where('conf.user_id', params.id)
                .where('conf.entity_id', params.entity_id)
                .select('dependencias.*', 'conf_dep.id as config_entity_dependencia_id')
        }
        // get entities
        dependencia = await dependencia.paginate(page, 20);
        dependencia = dependencia.toJSON();
        // generar imagenes
        await dependencia.data.map(async ent => {
            ent.logo_images =  await LINK_IMAGES(ent.logo, 'logo');
            ent.logo = URL(ent.logo);
        });
        // response
        return {
            success: true,
            status: 201,
            dependencia
        }
    }


    // obtener persona por id del usuairo
    person = async ({ params, request }) => {
        let person = await Person.query() 
            .with('document_type')
            .with('badge')  
            .join('users as u', 'u.person_id', 'people.id')
            .where('u.id', params.id)
            .select('people.*', 'u.id as user_id')
            .first();
        // response
        return {
            success: true,
            status: 201,
            person
        }
    }

    async autoResetPassword ({ params, request }) {
        let user = await User.find(params.id);
        if (!user) throw new NotFoundModelException("El usuario");
        let resetPass = uid(8);
        user.merge({ password: resetPass });
        await user.save();
        // enviar correo
        Event.fire('user::autoResetPassword', user, resetPass, request);
        // response
        return {
            success: true,
            status: 201,
            message: `La contraseña se auto-generó a: ${resetPass}`,
            password: resetPass
        }
    }

}

module.exports = UserController
