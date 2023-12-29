'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const App = use('App/Models/App');
const CustomException = require('../Exceptions/CustomException');
const { getResponseError } = require('../Services/response')

class SafeApplication {

  /**
   * credenciales para la app
   */
  credencial = {
    CLIENT_ID: 'ClientId',
    CLIENT_SECRET: 'ClientSecret',
  }

  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next) {
    try {
      // obtener los keys de las credenciales
      let { CLIENT_ID, CLIENT_SECRET } = this.credencial;
      // obtener los valodes de las credenciales
      let id = request.header(CLIENT_ID);
      let secret = `${request.header(CLIENT_SECRET)}`;
      // obtener app
      let app = await App.query()
        .where('client_id', id || "")
        .where('client_secret', secret || "")
        .first()
      // validar app
      if (!app) throw new Error('La aplicación no está registrada!')
      // validar si la app esta deshabilitada
      if (app.state == 0) throw new CustomException('La aplicación está deshabilitada!', 'ERR_APP')
      // setting app
      await app.getUrlCover();
      await app.getUrlIcon();
      app.getUrlFile();
      // add app a la respuest
      request.$app = app;
      // call next to advance the request
      await next()
    } catch (error) {
      return getResponseError(response, error);
    }
  }


}

module.exports = SafeApplication
