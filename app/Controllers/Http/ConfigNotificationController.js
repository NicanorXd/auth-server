'use strict'
const ConfigNotification = use('App/Models/ConfigNotification');


class ConfigNotificationController {

    /**
     * obtener un listado de las configuraciones de las notificaciones
     * @param {*} param0 
     */
    index = async ({ request }) => {
        let { page, query_search } = request.all();
        let config_notification = ConfigNotification.query()
            .with('method')
        // patinate
        config_notification = await config_notification.paginate(page || 1, 20);
        // recovery json
        config_notification = await config_notification.toJSON();
        await config_notification.data.map(con => con.userIds = JSON.parse(con.userIds))
        // response
        return {
            success: true,
            status: 201,
            config_notification
        }
    }

    /**
     * obtener una configuración de la notificación
     * @param {*} param0 
     */
    show = async ({ params, request }) => {
        let config_notification = await ConfigNotification.query().with('method').where('id', params.id).first();
        if (!config_notification) throw new Error('No se encontró la configuración de la notificación');
        config_notification = await config_notification.toJSON();
        config_notification.userIds = JSON.parse(config_notification.userIds);
        // response
        return {
            success: true,
            status: 201,
            config_notification
        }
    }

}

module.exports = ConfigNotificationController
