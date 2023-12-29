'use strict';

const System = use('App/Models/System');
const Method = use('App/Models/Method');
const { validateAll } = use('Validator');
const { validation, Storage } = require('validator-error-adonis');
const Helpers = use('Helpers');
const slugify = require('slugify');
const Encryption = use('Encryption')
const { LINK_LOCAL, LINK_PUBLIC } = require('../../../utils'); 
const { generateImage } = require('../../../utils/converImage');
const Config = use('Config');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')
const Module = use('App/Models/Module');


class SystemController {

    index = async ({ request, response }) => {
        let { page, query_search } = request.all();
        let systems = System.query();
        // filtro
        if (query_search) systems.where('name', 'LIKE', `%${query_search}%`)
        // paginación
        systems = await systems.paginate(page || 1, 20);
        // response
        return {
            success: true, 
            status: 201,
            systems
        }
    }

    store = async ({ request, response }) => {
        // validar
        await validation(validateAll, request.all(), {
            name: "required|max:100",
            path: "required|url|max:255",
            email: "required|email|max:100|unique:systems",
            version: "required|max:20",
            description: "required|min:2|max:255",
            support_name: 'required|max:100',
            support_link: 'required|url|max:255',
            support_email: 'required|email|max:100'
        });
        // get name system
        let name_file = slugify(request.input('name'), { lower: true });
        let alias = `${name_file}`.toUpperCase();
        // get config mail
        let config_mail_connection = Config.get('mail.connection')
        let config_mail_data = JSON.stringify(Config.get(`mail.${config_mail_connection}`))
        // payload
        let payload = {
            name: request.input('name'),
            path: request.input('path'),
            email: request.input('email'),
            version: request.input('version'),
            description: request.input('description'),
            support_name: request.input('support_name'),
            support_link: request.input('support_link'),
            support_email: request.input('support_email'),
            icon: request.input('icon', null),
            icon_mobile: request.input('icon_mobile', null),
            icon_desktop: request.input('icon_desktop', null),
            config_mail_connection,
            config_mail_data
        };
        // obtener systema
        let system = await System.findBy('alias', alias);
        if (system) throw new Error('El sistema ya está registrado!')
        // generar token
        payload.token = Encryption.encrypt(alias);
        // validar icono
        const icon = request.file('image', {
            types: ['image'],
            size: '2mb'
        });
        //validar icon
        if (icon) {
            await icon.move(Helpers.tmpPath('system/img'), {
                name: `${name_file}_image.png`
            })
            // add sizes
            await generateImage(Helpers.tmpPath(`system/img/${name_file}_image.png`));
            // add icon al payload
            payload.image = LINK_LOCAL(`system/img/${name_file}_icon.png`);
        } else {
            payload.image = LINK_PUBLIC('not-found.png');
        }
        // crear
        try {
            system = await System.create(payload);
            // response
            return {
                success: true,
                code: 201, 
                message: "El sistema se creó correctamente!",
                system
            }
        } catch (error) { throw new Error("No se pudó registrar el sistema") }
    }

    generateToken = async ({ params, request, response }) => {
        let system = await System.find(params.id);
        if (!system) throw new Error('No se encontró el sistema!');
        // geberar token
        system.merge({ token: Encryption.encrypt(system.alias) });
        await system.save();
        // response
        return {
            success: true,
            code: 201,
            message: "El token se generó correctamente!"
        }
    }

    show = async ({ params }) => {
        let { id } = params;
        let system = await System.query()
            .with('modules')
            .where('id', id)
            .first(id);
        if (!system) throw new NotFoundModelException("sistema");
        await system.getUrlImage();
        return {
            success: true,
            status: 201,
            system
        }
    }

    update = async ({ params, request }) => {
        let system = await System.find(params.id);
        if (!system) throw new NotFoundModelException('Sistema');
        // validar inputs
        await validation(validateAll, request.all(), {
            name: 'required|max:100',
            path: 'required|url|max:255',
            email: 'required|email|max:100',
            version: 'required|max:100',
            description: 'required|max:255',
            support_name: 'required|max:100',
            support_link: 'required|url|max:255',
            support_email: 'required|email|max:100'
        });
        // validar icon
        let icon = await Storage.saveFile(request, 'image', {
            type: 'image',
            size: '2mb',
            extmanes: ['jpg', 'jpge', 'png']
        }, Helpers, {
            path: 'system/img',
            options: {
                name: `${system.alias}_image`.toLowerCase(),
                overwrite: true
            }
        });
        // save icon
        if (icon.success) {
            await generateImage(icon.realPath);
            system.image = LINK_LOCAL(icon.path);
        }
        // actualizar los datos
        system.merge({
            name : request.input('name'),
            path : request.input('path'),
            email : request.input('email'),
            version : request.input('version'),
            description : request.input('description'),
            support_name : request.input('support_name'),
            support_link : request.input('support_link'),
            support_email : request.input('support_email'),
            icon : request.input('icon', null),
            icon_mobile: request.input('icon_mobile', null),
            icon_desktop: request.input('icon_desktop', null),
            config_mail_connection: request.input('config_mail_connection', null),
            config_mail_data: request.input('config_mail_data', JSON.stringify({}))
        })
        await system.save();
        // obtener imagen
        await system.getUrlImage();
        // response 
        return {
            success: true,
            code: 201,
            message: 'El sistema se actualizó correctamente!',
            system
        }    
    }

    method = async ({ params, request }) => {
        let { query_search, page, action_type } = request.all();
        let methods = Method.query()
            .where('system_id', params.id);
        // filtros
        if (query_search) methods.whereRaw(`(name like '%${query_search || ""}%' OR url like '%${query_search || ""}%' OR description like '%${query_search || ""}%')`);
        if (action_type && action_type != "ALL") methods.where('action_type', '=', action_type);
        // response 
        methods = await methods.paginate(page || 1, 20);
        return {
            success: true,
            status: 201,
            methods
        }
    }

    me = async ({ request, response }) => {
        let systemSecret = request.header('SystemSecret');
        let system = await System.findBy('token', systemSecret);
        if (!system) throw new Error('El Sistema no se encuentra registrado!');
        // get imagen
        await system.getUrlImage();
        // response
        return {
            success: true,
            code: 201,
            message: 'Systema encontrado con exito!',
            system
        }
    }

    module = async ({ params, request }) => {
        let { page } = request.all();
        let system = await System.find(params.id);
        if (!system) throw new NotFoundModelException("Sistema");
        let modules = await Module.query()
            .where('system_id', system.id)
            .paginate(page || 1, 20);
        // response
        return { 
            success: true,
            status: 201,
            system,
            modules
        }
    }
 
}

module.exports = SystemController
