'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Module extends Model {

    methods() {
        return this.hasMany("App/Models/Method")
    }

    system = () => {
        return this.belongsTo('App/Models/System');
    }
}

module.exports = Module
