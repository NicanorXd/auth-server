'use strict'

const Notification = use('App/Models/Notification');
const moment = require('moment');
const NotFoundModelException = require('../../../Exceptions/NotFoundModelException')
const System = use('App/Models/System');
const { validation } = require('validator-error-adonis');
const DB = use('Database');

class NotificationController {
    
    index = async ({ request, response }) => {
        let auth = request.$user;
        let { page, read } = request.all();
        
        // get notification
        let notification = auth.notifications()
            .with('method', (build) => {
                build.setVisible(['id', 'name', 'description', 'system_id', 'image'])
                build.with('system', (buildS) => {
                    buildS.setVisible(['id', 'alias', 'description', 'email']);
                })  
            })
            .with('receive', (build) => build.select('id', 'username', 'image'))
            .with('send', (build) => build.select('id', 'username', 'image'))
            .orderBy('created_at', 'DESC')
        // filtrar
        if (read) {
            read = read == 'true' ? true : false;
            if (read) notification.whereNotNull('read_at');
            else notification.whereNull('read_at');
        } 
        // paginate
        notification = await notification.paginate(page || 1, 20)
        // no leidas
        let count_unread = await Notification.query()
            .where('receive_id', auth.id)
            .whereNull('read_at')
            .getCount();
        // leidas
        let count_read = await Notification.query()
            .where('receive_id', auth.id)
            .whereNotNull('read_at')
            .getCount();
        // generate imagen
        notification = notification.toJSON();
        // response 
        return { 
            success: true,
            status: 201,
            notification,
            count_read,
            count_unread
        };
    }

    store = async ({ request, response }) => {
        await validation(null, request.all(), {
            receive_id: 'required',
            title: "required|max:255",
            description: 'required|max:255',
            method: 'required',
            object_type: 'required',
            object_id: 'required'
        });
        // obtener system key
        let systemSecret = request.header('SystemSecret');
        let system = await System.query()
            .join('methods as met', 'met.system_id', 'systems.id')
            .where('systems.token', systemSecret || "")
            .where('met.name', request.input('method'))
            .select('systems.*', DB.raw(`met.id as method_id`))
            .first();
        if (!system) throw new NotFoundModelException('El Sistema');
        let auth = request.$user;
        // enviar notification
        let notification = await Notification.create({
            send_id: auth.id,
            receive_id: request.input('receive_id'),
            title: request.input('title'),
            description: request.input('description'),
            method_id: system.method_id,
            object_type: request.input('object_type'),
            object_id: request.input('object_id')
        });
        // obtener dependencias
        notification.method = await notification.method().with('system', (build) => {
            build.setVisible(['id', 'alias', 'description', 'email']); 
        }).fetch()
        notification.receive = await notification.receive().fetch();
        notification.send = await notification.send().fetch();
        // testing
        let socket = request.$io();
        // emitir evento
        await socket.emit('NotificationListener.store', notification);
        // response
        return {
            success: true,
            status: 201,
            message: "La notificación fué enviada!",
            notification
        }
    }

    show = async ({ params, request }) => {
        let auth = request.$user;
        let notify = await Notification.query()
            .with('method', (build) => {
                build.setVisible(['id', 'name', 'description', 'system_id', 'image'])
                build.with('system', (buildS) => {
                    buildS.setVisible(['id', 'alias', 'description', 'email']);
                })  
            })
            .with('receive', (build) => {
                build.with('person')
                build.select('id', 'username', 'image', 'person_id')
            })
            .with('send', (build) => {
                build.with('person')
                build.select('id', 'username', 'image', 'person_id');
            })
            .where('receive_id', auth.id)
            .where('id', params.id)
            .first();
        if (!notify) throw new NotFoundModelException("la notificación");
        // verificar el leido
        if (!notify.read_at) {
            notify.merge({ read_at: moment().format('YYYY-MM-DD hh:ss:mm') });
            await notify.save();
        }
        // response
        return {
            success: true,
            status: 201,
            notification: notify
        }
    }

    markAsRead = async ({ params, request }) => {
        let auth = request.$user;
        let notify = auth.notifications()
            .where('id', params.id)
            .first();
        // validar notify
        if (!notify) throw new Error('No se encontró la notificación');
        // marcar como leído la notificación
        notify.read_at = moment().format('YYYY-MM-DD HH:mm:ss');
        await notify.save();
        // response 
        return {
            success: true,
            status: 201,
            message: 'La notificación se marcó como leído correctamente!',
            notify
        }
    }

    markAsReadAll = async ({ request }) => {
        let auth = request.$user;
        await auth.notifications()
            .whereNull('read_at')
            .debug(['enabled'])
            .update({ read_at: moment().format('YYYY-MM-DD HH:mm:ss') });
        // response 
        return {
            success: true,
            status: 201,
            message: 'Todas las notificaciones se marcarón como leídas!'
        }
    }

}

module.exports = NotificationController
