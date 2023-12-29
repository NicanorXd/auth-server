'use strict'

const User = use('App/Models/User');
const Token = use('App/Models/Token');
const Person = use('App/Models/Person');
const { validate, validateAll } = use('Validator');
const { validation, ValidatorError } = require('validator-error-adonis');
const Encryption = use('Encryption');
const Event = use('Event');
const System = use('App/Models/System');
const ConfigEntity = use('App/Models/ConfigEntity');
const { URL, LINK_LOCAL, LINK_IMAGES, generateImage } = require('../../../../utils');
const { Storage } = require('validator-error-adonis');
const Helpers = use('Helpers');
const Dependencia = use('App/Models/Dependencia');
const Drive = use('Drive');

class AuthController {

    /**
     *  obtener datos de usuario authenticado
     * @param {*} context
     */
    me = async ({ request, response }) => {
        let person = await request.$user.person()
            .with('document_type')
            .with('badge')
            .fetch();
        request.$user.person = person;
        request.$user.token = request.$token;
        // response
        return {
          success: true,
          code: 201,
          message: "usuario logeado",
          user: request.$user
        }
    }

    /**
     *  cambiar imagen
     */
    changeImage = async ({ request, response }) => {
        // get auth
        let auth = request.$user;
        let newAuth = { user: {} };
        // variable 
        let upload = {};

        if (request.input('data') && request.input('type')) {
            let extname = `${request.input('type')}`.split('/').pop();
            let filename = `perfil_${auth.username}.${extname}`;
            let path = `/user/img/${filename}`;
            let bf = Buffer.from(request.input('data'), 'base64');
            await Drive.put(Helpers.tmpPath(path), bf);
            upload.success = true;
            upload.path = path;
            upload.realPath = Helpers.tmpPath(path);
        } else {
            // save image
            upload = await Storage.saveFile(request, 'image', {
                required: true,
                types: ['image'],
                size: '2mb'
            }, Helpers, {
                path: '/user/img',
                options: {
                    name: `perfil_${auth.username}`,
                    overwrite: true
                }
            })
        }
        // validar subida
        if (upload.success) {
            await User.query()
                .where('id', auth.id)
                .update({ image: LINK_LOCAL(upload.path) });
            // generar imagenes optimizadas
            await generateImage(upload.realPath);
            // update auth
            await auth.reload();
            request.$user = auth;
            newAuth = await this.me({ request, response });
        }
        // response
        return {
            success: true,
            status: 201,
            message: "El perfil se actualizó correctamente",
            auth: newAuth.user
        }
    }   

    /**
     *  cambiar Contraseña
     */
    changePassword = async ({ request, response }) => {
        // valdiar inputs
        await validation(validate, request.all(), {
            password_validation: 'required|min:6',
            password_new: 'required|min:6',
            password_confirm: 'required|min:6'
        });
        // get auth
        let auth = request.$user;
        let token = request.$token;
        // validar contraseña
        if (Encryption.decrypt(auth.password) != request.input('password_validation')) throw new ValidatorError([ {field: 'password_validation', message: `La contraseña de validación es incorrecta`} ])
        // validar el cambio de la nueva contraseña
        if (Encryption.decrypt(auth.password) == request.input('password_new')) throw new ValidatorError([ {field: 'password_new', message: `La contraseña debe ser diferente a la actual`} ])
        // validar confirmación de contraseña
        if (request.input('password_new') != request.input('password_confirm')) throw new ValidatorError([ {field: 'password_confirm', message: `La contraseña de confirmación no coincide`} ])
        // cambiar contraseña
        await User.query()
            .where('id', auth.id)
            .update({ password: Encryption.encrypt(request.input('password_new')) });
        // cerrar otras sesiónes abiertas
        await Token.query()
            .where('user_id', auth.id)
            .where('id', '<>', token.id)
            .update({ is_revoked : 1 });
        // response
        return {
            success: true,
            status: 201,
            message: "La contraseña se cambió correctamente",
        }
    } 

    /**
     * Obtener menu de usuario authenticado 
     * @param {*} param0 
     */
    menu = async ({ request, response }) => {
        if (request.$user.except) return await System.query().with('modules', (m) => {
          m.join('config_modules as conf', 'conf.module_id', 'modules.id')
          .select('conf.id', 'modules.name', 'modules.alias', 'modules.description', 'conf.slug', 'conf.icon', 'modules.system_id')
        }).fetch();
        // obtener systemas
        let systems = await System.query()
            .whereHas('modules', (builder) => {
                builder.join('permissions as per', 'per.module_id', 'modules.id')
                    .join('config_modules as conf', 'conf.module_id', 'modules.id')
                    .where('conf.app_id', request.$app.id)
                    .where('per.user_id', request.$user.id)
            }).with('modules', (m) => {
                m.join('permissions as per', 'per.module_id', 'modules.id')
                  .join('config_modules as conf', 'conf.module_id', 'modules.id')
                  .where('conf.app_id', request.$app.id)
                  .where('per.user_id', request.$user.id)
                  .select('conf.id', 'modules.name', 'modules.alias', 'modules.description', 'conf.slug', 'conf.icon', 'modules.system_id', 'per.user_id')
            })
            .select(
                'systems.id', 'systems.alias', 'systems.name', 'systems.description', 'systems.icon', 
                'systems.icon_desktop', 'systems.icon_mobile', 'systems.image', 'systems.version'
            )
            .fetch();
        // response
        return systems.toJSON();
    }

    /** 
     * Listar las entidades permitidas al auth
     * @param {request} param0
     * @param {response} param1 
     */
    entity = async ({ request, response }) => {
        let { query_search, page } = request.all();
        let entities = await ConfigEntity.query()
            .join('entities as ent', 'ent.id', 'config_entities.entity_id')
            .where('config_entities.user_id', '=', request.$user.id)
            .select('ent.*')
            .paginate(page, 20);
        entities = entities.toJSON();
        // generar imagenes
        await entities.data.map(async ent => {
            ent.logo_images =  await LINK_IMAGES(ent.logo, 'logo');
            ent.logo = URL(ent.logo);
        });
        // response
        return entities;
    }

    /**
     * obtener la entidad del auth por el id
     * @param {params} param0
     * @param {request} param1
     * @param {response} param2 
     */
    entityID = async ({ params, request, response }) => {
        let entity = await ConfigEntity.query()
            .join('entities as ent', 'ent.id', 'config_entities.entity_id')
            .where('config_entities.user_id', '=', request.$user.id)
            .where('ent.id', params.id)
            .select('ent.*')
            .first();
        if (!entity) throw new Error("No se encontro la entidad");
        entity.logo_images = await LINK_IMAGES(entity.logo, 'logo');
        entity.logo = URL(entity.logo);
        // response
        return entity;
    }

    /**
     * obtener todas las dependencias del auth por la entityId
     * @param {*} param0 
     */
    dependencia = async ({ params, request }) => {
        let { page } = request.all();
        let dependencia = await Dependencia.query()
            .join('config_entity_dependencias as conf', 'conf.dependencia_id', 'dependencias.id')
            .join('config_entities as ent', 'ent.id', 'conf.config_entity_id')
            .where('ent.user_id', request.$user.id)
            .where('ent.entity_id', params.entityId)
            .select('dependencias.*')
            .paginate(page || 1, 20);
        // response 
        return {
            success: true,
            status: 201,
            code: 'RES_AUTH_DEPENDENCIA',
            dependencia
        }
    }
    
    /**
     * obtener la dependencia del auth por el id
     * @param {*} param0 
     */
    dependenciaID = async ({ params, request }) => {
        let dependencia = await Dependencia.query()
            .join('config_entity_dependencias as conf', 'conf.dependencia_id', 'dependencias.id')
            .join('config_entities as ent', 'ent.id', 'conf.config_entity_id')
            .where('dependencias.id', params.id)
            .where('ent.user_id', request.$user.id)
            .where('ent.entity_id', params.entityId)
            .select('dependencias.*')
            .first();
        // validar 
        if (!dependencia) throw new Error('No se encontró la dependencia');
        // response
        return {
            success: true, 
            status: 201,
            code: 'RES_FIND',
            dependencia
        }
    }

    /**
     * actulizar datos del auth 
     * @param {*} param0 
     */
    update = async ({ request, response }) => {
        // validar inputs
        await validation(validateAll, request.all(), {
            email: "required|email|max:100", 
            date_of_birth: 'required|date',   
            marital_status: 'required|max:2',
            gender: 'required|max:2',
            cod_dep: 'required|max:3',
            cod_pro: 'required|max:3',
            cod_dis: 'required|max:3',
            address: 'required|max:255',
            phone: 'required|min:5|max:12',
            password_confirm: "required|min:8|max:20"
        });
        // obtener auth y token
        let auth = request.$user;
        let token = request.$token;
        let ubigeo = `${request.input('cod_dep')}${request.input('cod_pro')}${request.input('cod_dis')}`;
        //verificar password
        if (await Encryption.decrypt(auth.password) != request.input('password_confirm')) throw new ValidatorError([
            { field: 'password_confirm', message: 'La contraseña de confirmación es incorrecta' }
        ]);
        // validar email unico
        if (await User.query().where('id', '<>', auth.id).where('email', request.input('email')).getCount()) throw new ValidatorError([
            { field: 'email', message: 'El correo electrónico ya está en uso' }
        ]);
        // procesar
        // actualizar auth
        await User.query()
        .where('id', auth.id)
        .update({ email: request.input('email') });
        // reload auth
        await auth.reload()
        // revocar todos los tokens
        await Token.query() 
            .where('user_id', auth.id)
            .where('id', '<>', token.id)
            .update({ is_revoked: 1 });
        // actualizar datos de persona
        let person = await Person.find(auth.person_id);
        let payload = {
            email_contact: request.input('email', ''),
            date_of_birth: request.input('date_of_birth', ''),
            marital_status: request.input('marital_status', ''),
            gender: request.input('gender', ''),
            badge_id: ubigeo,
            address: request.input('address', ''),
            phone: request.input('phone', ''),
        }
        person.merge(payload);
        await person.save();
        // send email only email != request.email
        Event.fire("user::changedData", request._system, auth);
        // response 
        return {
            success: true,
            message: "Los datos se guardarón correctamente",
            status: 201,
            user: auth
        }
    }

    /**
     * listar log de tokens
     * @param {*} param0 
     */
    tokens = async ({ request, response }) => {
        let { page } = request.all();
        let user = request.$user;
        let tokens = await user.tokens()
            .orderBy('created_at', 'DESC')
            .paginate(page || 1, 20);
        // response 
        return {
            success: true,
            status: 201,
            tokens
        }
    }
}

module.exports = AuthController
