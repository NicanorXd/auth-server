'use strict'

const { validate, validateAll } = use('Validator');
const random = require('random');
const App = use('App/Models/App');
const Method = use('App/Models/Method');
const ConfigModule = use('App/Models/ConfigModule');
const Encryption = use('Encryption')
const slugify = require('slugify');
const { validation } = require('validator-error-adonis');
const Helpers = use('Helpers');
const { LINK_LOCAL, generateImage } = require('../../../utils');
const NotFoundModelException = require('../../Exceptions/NotFoundModelException')

class AppController {

    allow = () => {
        return {
            success : true,
            message: "los recursos están disponibles"
        }
    }

    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let apps = App.query()
        //filtro
        if (query_search) apps = apps.where('name', 'like', `%${query_search}%`)
        // pagination
        apps = await apps.paginate(page || 1, 20);
        apps = await apps.toJSON();
        // response
        return {
            success: true,
            status: 201,
            apps
        }
    }

    /**
     * crear app cliente
     */
    store = async ({ request, response }) => {
        // validar
        await validation(null, request.all(), {
            name : "required",
            client_device: "required",
            support_name: "required",
            support_link: "required|url"
        });
        // procesar
        try {
            // generar client_id y  client_token
            let name_file = slugify(request.input('name'), { lower: true });
            let client_id = random.int(100000, 999999);
            let client_secret = Encryption.encrypt(`${request.input('name')}-${request.input('client_device')}-${random.int(100000, 999999)}`);
            // payload
            let payload = {
                name: request.input('name'),
                client_id: client_id,
                client_device: request.input('client_device'),
                client_secret: client_secret,
                support_name: request.input('support_name'),
                support_link: request.input('support_link'),
            };
            // obtener app
            let app = await App.findBy('name', request.input('name'));
            if (app) throw new Error("La aplicación ya está registrada!");
            // obtener cover
            let cover = request.file('cover', {
                types: ['image'],
                size: '2mb'
            });
            // obtener icon
            let icon = request.file('icon', {
                types: ['image'],
                size: '2mb'
            });
            // obtener file
            let file = request.file('file', {
                size: '100mb'
            });
            // validar file
            if (!cover) throw new Error("El cover es obligatorio");
            if (!icon) throw new Error("El icon es obligatorio");
            if (file) {
                await file.move(Helpers.tmpPath('app/file'), {
                    name: `${name_file}_file.${file.extname}`,
                    overwrite: true
                });
                // add payload
                payload.file = LINK_LOCAL(`app/file/${name_file}_file.${file.extname}`);
            }
            // mover cover
            await cover.move(Helpers.tmpPath('app/img'), {
                name: `${name_file}_cover.png`,
                overwrite: true
            });
            // mover icon
            await icon.move(Helpers.tmpPath('app/img'), {
                name: `${name_file}_icon.png`,
                overwrite: true
            });
            // generar imagen obtimizadas
            await generateImage(Helpers.tmpPath(`app/img/${name_file}_cover.png`));
            await generateImage(Helpers.tmpPath(`app/img/${name_file}_icon.png`));
            // add payload
            payload.cover = LINK_LOCAL(`app/img/${name_file}_cover.png`)
            payload.icon = LINK_LOCAL(`app/img/${name_file}_icon.png`)
            // procesar
            try {
                // guardar los datos
                await App.create(payload);
                // response
                return {
                    success: true,
                    code: 201,
                    message: "La aplicación se registró correctamente!"
                }
            } catch (error) { throw new Error('No se pudo registrar la aplicación') }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

    /**
     * Mostar datos de una app
     * @param {*} param0 
     */
    show = async ({ params, request }) => {
        let app = await App.find(params.id);
        if (!app) throw new NotFoundModelException("App");
        await app.getUrlCover(true);
        await app.getUrlIcon(true);
        app.getUrlFile(true);
        // response
        return {
            success: true,
            status: 201,
            app
        }
    }

    /**
     * Actualizar App
     * @param {*} param0 
     */
    update = async ({ params, request }) => {
        // validation
        await validation(validateAll, request.all(), {
            name: `required|unique:apps,name,id,${params.id}`,
            support_name: 'required|max:100',
            support_link: 'required|url|max:255'
        });
        // obtener app
        let app = await App.find(params.id);
        // obtener filename
        let filename = slugify(request.input('name'), { lower: true });
        // validar cover
        let cover = request.file('cover', {
            types: ['image'],
            size: '2mb'
        });
        // obtener icon
        let icon = request.file('icon', {
            types: ['image'],
            size: '2mb'
        });
        // obtener file
        let file = request.file('file', {
            size: '100mb'
        });
        // guardar archivos
        if (cover) {
            await cover.move(Helpers.tmpPath('app/img'), { name: `${filename}_cover.png`, overwrite: true });
            app.cover = LINK_LOCAL(`app/img/${filename}_cover.png`);
            await generateImage(Helpers.tmpPath(`app/img/${filename}_cover.png`));
        }
        // save icon
        if (icon) {
            await icon.move(Helpers.tmpPath('app/img'), { name: `${filename}_icon.png`, overwrite: true });
            app.icon = LINK_LOCAL(`app/img/${filename}_icon.png`);
            await generateImage(Helpers.tmpPath(`app/img/${filename}_icon.png`));
        }
        if (file) {
            await file.move(Helpers.tmpPath('app/file'), { name: `${filename}_file.${file.extname}`, overwrite: true });
            app.file = LINK_LOCAL(`app/file/${filename}_file.${file.extname}`);
        }
        // add más datos
        app.name = request.input('name');
        app.support_name = request.input('support_name');
        app.support_link = request.input('support_link');
        try {
            // guardar
            await app.save();
            // refrescar los links
            await app.getUrlCover(true);
            await app.getUrlIcon(true);
            app.getUrlFile(true);
            // response
            return {
                success: true,
                code: 201,
                message: "La aplicación se actualizó correctamente",
                app
            }
        } catch (error) { 
            throw new Error('No se pudo actualizar la app') 
        }
    }

    /**
     * Validar autorización de la App
     * @param {*} param0 
     */
    authorize = async ({ request }) => {
        try {
            let { client_id, client_secret } = request.all();
            let app = await App.query()
                .where('client_id', client_id || "")
                .where('client_secret', client_secret || "")
                .first();
            // validar
            if (!app) throw new Error('La aplicación no está registrada');
            // serializar
            app = app.toJSON();
            // response
            return {
                success: true,
                code: 201,
                message: "Aplicación permitida!",
                app
            };
        } catch (error) {
            return {
                success: false,
                code: 401,
                message: error.message
            };
        }
    }

    /**
     * Validar Autorización de la App autenticada
     * @param {*} param0 
     */
    me = async ({request }) => {
      return {
        success: true,
        code: 201,
        message: "Aplicación Permitida!",
        app: request.$app
      }
    }

    /**
     * Cambiar el estado de la App
     * @param {*} param0 
     */
    state = async ({ params, request }) => {
        try {
            // obtener app
            let app = await App.find(params.id);
            if (!app) throw new Error('No se encontró la Aplicación');
            let { state } = request.all();
            app.state = state ? 1 : 0;
            await app.save();
            // response 
            return {
                success: true,
                code: 201,
                message: `La Aplicación ${app.name} fué ${app.state ? 'Restaurada' : 'Desactivada'} correctamente!`
            }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

    /**
     * Modulos permitodos
     * @param {*} param0 
     */
    configModule = async ({ params, request }) => {
        let app = await App.find(params.id);
        if (!app) throw new NotFoundModelException("App");
        let { page } = request.all();
        // ontener menus
        let menus = await ConfigModule.query()
            .with('module', (build) => {
                build.with('system')
            })
            .where('app_id', app.id)
            .join('modules as m', 'm.id', 'config_modules.module_id')
            .join('systems as s', 's.id', 'm.system_id')
            .select('config_modules.*')
            .orderBy('m.system_id', 'ASC')
            .orderBy('m.id', 'ASC')
            .paginate(page || 1, 20);
        // response
        return {
            success: true,
            status: 201,
            menus
        };
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
        if (block == 1) methods.whereRaw(`EXISTS (SELECT null FROM block_method_apps WHERE app_id = ${params.id} AND methods.id = method_id)`);
        else methods.whereRaw(`NOT EXISTS (SELECT null FROM block_method_apps WHERE app_id = ${params.id} AND methods.id = method_id)`);
        // paginar
        methods = await methods.paginate(page || 1, 20);
        // response 
        return {
            success: true,
            status: 201,
            methods
        };
    }

}

module.exports = AppController
