'use strict'

const ConfigNotification = use('App/Models/ConfigNotification');
const db = use('Database');

const HandleMethod = exports = module.exports = {}

HandleMethod.notification = async (user, name) => {
    try {
        let config_notification = await ConfigNotification.query()
            .join('methods as met', 'met.id', 'config_notifications.method_id')
            .where('met.name', name || "")
            .select('config_notifications.*')
            .first();
        // validar configuración de notificaciones automaticas
        if (config_notification) {
            config_notification = await config_notification.toJSON();
            let userIds = JSON.parse(config_notification.userIds) || [];
            let paylaod = [];
            let queryUser = db.table('config_notifications as conf')
                .join('users as u')
                .where('conf.id', user.id)
                .where('u.id', '<>', user.id)
                .select(db.raw(`${user.id} as send_id`), 'u.id as receive_id', 'conf.title', 'conf.description', 
                    'conf.icon', 'conf.icon_mobile', 'conf.icon_desktop', 'conf.image', 'conf.url',
                    db.raw('NOW(), NOW()'))
            // validar except
            queryUser = config_notification.except ? queryUser.whereNotIn('u.id', userIds) : queryUser.whereIn('u.id', userIds)
            // insert notificaciones
            await db.raw(`INSERT INTO notifications (send_id, receive_id, title, description, icon, icon_mobile, icon_desktop, image, url, created_at, updated_at) ${queryUser}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}
