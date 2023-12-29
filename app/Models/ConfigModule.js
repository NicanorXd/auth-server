'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ConfigModule extends Model {

    module = () => {
        return this.belongsTo('App/Models/Module');
    }

}

module.exports = ConfigModule
