'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const BlockMethodApp = use('App/Models/BlockMethodApp');
const CustomException = require('../Exceptions/CustomException');
const { getResponseError } = require('../Services/response')

class AllowAction {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next, properties) {
      try {
        // metodo local
        let nameMethod = properties[0];
        let allow = request.input('allow');
        request.$method = nameMethod ? nameMethod : allow;
        request.$systemID = request.header('SystemId', request._system.id);
        // validamos si puede realizar la acción
        let block = await BlockMethodApp.query()
          .join('methods as met', 'met.id', 'block_method_apps.method_id')
          .where('met.name', request.$method || "")
          .where('block_method_apps.app_id', request.$app.id)
          .first();
        if (block) throw new CustomException("La aplicación no puede realizar la siguiente acción", "ERR_ALLOW");
        // continuar
        await next();
      } catch (error) {
        return getResponseError(response, error);
      }
  }



}

module.exports = AllowAction
