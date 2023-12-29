'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Env = use('Env');
const System = use('App/Models/System');
const SystemException = require('../Exceptions/SystemException');
const { getResponseError } = require('../Services/response');

class SystemProvider {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next) {
    try {
      // call next to advance the request
      let key = Env.get('SYSTEM_KEY');
      let system = await System.findBy('token', key);
      if (!system) throw new SystemException("la credencial del sistema no es valido!");
      await system.getUrlImage();
      request._system = system;
      await next()
    } catch (error) {
      await getResponseError(response, error);
    }
  }
}

module.exports = SystemProvider
