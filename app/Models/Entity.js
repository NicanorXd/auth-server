'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { URL, LINK_SIZES } = require('../../utils');

class Entity extends Model {

    static get computed () {
        return ['logo_images'];
    }

    // getters
    getLogo = (value) => {
        return URL(value);
    }


    // computed
    getImageImages = () => {
        let images = LINK_SIZES(this.logo, 'logo');
        return images;
    }

    getUrlLogo = async () => {
        this.logo_images = await LINK_IMAGES(this.logo, 'logo');
        this.logo = URL(this.logo);
        return this;
    }

}

module.exports = Entity
