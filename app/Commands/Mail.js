'use strict'

const { Command } = require('@adonisjs/ace')
const Axios = require('axios').default;

class Mail extends Command {
  static get signature () {
    return 'mail'
  }

  static get description () {
    return 'Generador de mailables'
  }

  async handle (args, options) {
    await Axios.get(`https://siga.unia.edu.pe/api_rest/alumnos/dni/72172231`, { 
      headers: {
        Authorization: `Bearer 1|rFNIomXdLRbUcF9ZPAWhBpOpe9SgkXWJTGIjUyZK`
      }
    }).then(res => {
      console.log(res.data)
    }).catch(err => {
      console.log(err)
    });
  }
}

module.exports = Mail
