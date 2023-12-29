'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { URL } = require('../../utils');
const Token = use('App/Models/Token');
const User = use('App/Models/User');
const Event = use('Event');
const System = use('App/Models/System');
const { getResponseError } = require('../Services/response')

class AuthJWT {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, response }, next, properties) {
    // call next to advance the request
    try {
        let type = properties[0] || 'strict';
        const Authorization = request.header('Authorization');
        // call next to advance the request
        let auth = await this.recoveryToken(Authorization);
        // verificamos que exista un token
        switch (type) {
          case 'auto':
            request = await this.executeAuto({ request, response, auth });
            break;
          case 'strict':
            request = await this.executeStrict({ request, response, auth });
            break;
          default:
            request = await this.executeStrict({ request, response, auth });
            break;
        }
        // next controller
        await next()
    } catch (error) {
      return getResponseError(response, error);
    }
  }

  recoveryToken(bearer = "") {
    const parse = bearer.split(" ");
    return {
      type: parse[0],
      token: parse[1]
    }
  }

  generateMethod = async (request) => {
    let method = request.input('method') ? request.input('method') : request.$method;
    return {
      method: method ? method : "",
      self_system: request.$method ? true : false
    }
  }

  generateNotification = async (request) => {
    // get method
    let { method, self_system } = await this.generateMethod(request);
    // validar methodo
    if (!method) return false;
    // verificar si es de un sistema de terceros
    if (self_system) {
      // validar systema
      let system = await System.findBy('token', request.header('SystemSecret', ''));
      if (!system) return false;
    }
    // emitir evento
    Event.fire("allow::notification", request.$user, method);
  }

  executeStrict = async ({ request, response, auth }) => {
    if (!auth.token) throw new Error('Usted necesita un token de autorización');
    // hacemos match con el token de la base de datos
    let token = await Token.query().where('token', auth.token).first();
    // verificamos que el token no exista
    if (!token) throw new Error('El token es invalido!'); 
    // verificamos que el token ya expíro
    if (token.is_revoked) throw new Error('El token ya expíro');
    // obtenemos al usuario authenticado
    let user = await User.find(token.user_id);
    // save user authenticated
    request.$user = user;
    request.$token = token;
    // generate notification automatica
    this.generateNotification(request);
    // response
    return request;
  }

  executeAuto = async ({ request, response, auth }) => {
    if (auth.token) {
      // hacemos match con el token de la base de datos
      let token = await Token.query().where('token', auth.token).first();
      // verificamos que el token exista
      if (token) {
        // verificamos que el token sea válido
        if (!token.is_revoked) {
          // obtenemos al usuario authenticado
          let user = await User.find(token.user_id);
          // save user authenticated
          request.$user = user;
          request.$token = token;
          // generate notification automatica
          this.generateNotification(request);
        }
      }
    }
    // response
    return request;
  }

}

module.exports = AuthJWT
