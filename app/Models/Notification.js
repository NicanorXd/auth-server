'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Notification extends Model {

    // method
    method () {
        return this.belongsTo('App/Models/Method');
    }

    // relations
    receive() {
        return this.belongsTo('App/Models/User', 'receive_id', 'id');
    }

    send() {
        return this.belongsTo('App/Models/User', 'send_id', 'id');
    }

}

module.exports = Notification
