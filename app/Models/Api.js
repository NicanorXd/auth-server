'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Api extends Model {

    // getters
    getHeaders (value) {
        return JSON.parse(value);
    }

}

module.exports = Api
