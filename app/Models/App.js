'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { URL, LINK_IMAGES } = require('../../utils');

class App extends Model {

    getUrlIcon = async (up = false) => {
        this.icon_images = await LINK_IMAGES(this.icon, 'icon');
        this.icon = URL(this.icon, up);
    }

    getUrlCover = async (up = false) => {
        this.cover_images = await LINK_IMAGES(this.cover, 'cover');
        this.cover = URL(this.cover, up);
    }

    getUrlFile = (up = false) => {
        this.file = this.file ? URL(this.file, up) : null;
    }

}

module.exports = App
