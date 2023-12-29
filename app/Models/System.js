'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { URL, LINK_IMAGES } = require('../../utils');

class System extends Model {

    static boot() {
        super.boot();
        this.addHook('beforeSave', 'SystemHook.generarAlias');
    }

    getUrlImage = async () => {
        this.image_images = await LINK_IMAGES(this.image, 'image');
        this.image = URL(this.image);
    }

    getConfigMailData = (value) => {
        return JSON.parse(value) || {};
    }

    modules() {
        return this.hasMany("App/Models/Module")
    }

}

module.exports = System;
