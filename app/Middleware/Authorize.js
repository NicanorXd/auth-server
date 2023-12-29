'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const CustomException = require('../Exceptions/CustomException');
const { getResponseError } = require('../Services/response')
const BlockMethodUser = use('App/Models/BlockMethodUser');

class Authorize {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next) {
    try {
      if (request.$method && request.$user) {
        let block = await BlockMethodUser.query()
          .join('methods as m', 'm.id', 'block_method_users.method_id')
          .where('m.name', request.$method)
          .where('m.system_id', request.$systemID)
          .where('block_method_users.user_id', request.$user.id)
          .first();
        // generar error de blocking
        if (block) throw new CustomException("El usuario no puede realizar la acción", "BLOCK_USER");
      }
      // execute
      await next()
    } catch (error) {
      return getResponseError(response, error);
    }
  }
}

module.exports = Authorize
