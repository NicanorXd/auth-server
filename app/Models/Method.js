'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { URL } = require('../../utils');

class Method extends Model {

    // setting
    getImage (value) {
        return value ? URL(value) : value;
    }

    system () {
        return this.belongsTo('App/Models/System');
    }

}

module.exports = Method
