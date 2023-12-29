'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Badge extends Model {

    provincias = () => {
        return this.hasMany('App/Models/Badge', 'cod_dep', 'cod_dep')
    }

    distritos = () => {
        return this.hasMany('App/Models/Badge', 'cod_pro', 'cod_pro', 'cod_dep', 'cod_dep')
    }

}

module.exports = Badge
