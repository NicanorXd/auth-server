'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { LINK_IMAGES, URL, getAge, LINK_SIZES } = require('../../utils');
const Encryption = use('Encryption');


class Person extends Model {

    static get table() {
        return 'people';
    }

    static get hidden() {
        return ['password_signatured'];
    }

    static get computed() {
        return ['edad', 'image_images', 'cod_dep', 'cod_pro', 'cod_dis'];
    }

    static boot() {
        super.boot();
        this.addHook('beforeSave', 'PersonHook.toLowerCase');
    }

    // getters
    getImage = (value) => {
        return URL(value);
    }


    // computed
    getEdad =  () => {
        let edad = getAge(this.date_of_birth);
        return edad;
    }

    getImageImages = () => {
        let images = LINK_SIZES(this.image, 'image');
        return images;
    }

    getCodDep = () => {
        return `${this.badge_id}`.substr(0, 2) || "00"; 
    }

    getCodPro = () => {
        return `${this.badge_id}`.substr(2, 2) || "00";
    }

    getCodDis = () => {
        return `${this.badge_id}`.substr(4, 2) || "00";
    }


    // funciones
    getPasswordSignatured = async () => {
        try {
            return await Encryption.decrypt(this.password_signatured);
        } catch (error) {
            return this.password_signatured;
        }
    }

    getUrlImage = async () => {
        this.image_images = await LINK_IMAGES(this.image, "image");
        this.image = URL(this.image);
        return this;
    }


    // relaciones
    document_type = () => {
        return this.belongsTo('App/Models/DocumentType', 'document_type_id', 'code')
    }

    badge = () => {
        return this.belongsTo('App/Models/Badge', 'badge_id', 'cod_ubi');
    }
}

module.exports = Person;
