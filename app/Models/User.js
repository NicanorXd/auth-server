'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { LINK_SIZES, URL } = require('../../utils');

/** @type {import('@adonisjs/framework/src/Hash')} */



class User extends Model {

  static boot () {
    super.boot()
    this.addHook('beforeSave', 'UserHook.hashPassword');
    this.addHook('beforeSave', 'UserHook.imageDefault');
  }

  static get hidden () {
    return ['password', 'token_verification', 'reset_password']
  }

  static get computed() {
    return ['image_images'];
  }

  // getters
  getImage = (value) => {
    return URL(value);
  }


  // computed
  getImageImages = () => {
    let images = LINK_SIZES(this.image, 'image');
    return images;
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  profiles() {
    return this.hasMany("App/Models/Profile");
  }

  person() {
    return this.belongsTo('App/Models/Person');
  }
  
  notifications() {
    return this.hasMany('App/Models/Notification', 'id', 'receive_id')
  }
}

module.exports = User
