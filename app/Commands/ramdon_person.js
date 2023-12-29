'use strict'

const Person = use('App/Models/Person');
const fetch = require('node-fetch');

const { Command } = require('@adonisjs/ace')

class ValidarDni extends Command {
  static get signature () {
    return 'validar:dni'
  }

  static get description () {
    return 'Comando para validar datos personales de reniec'
  }

  async personRandom () {
    fetch('https://randomuser.me/api/')
    .then(resData => resData.json())
    .then(res => console.log(res.results))
    .catch(err => console.log(err.message));
  }

  validarDNI = async () => {
    let numero = "";
    let people = await Person.query()
      .where("verify", "=", 0)
      .fetch();
    people = people.toJSON();
    let errors = [];
    await people.filter(async obj => await this.requestRENIEC(obj, errors))
    // ejecutar los errors
    console.log(`errores: ${errors.length}`);
    await errors.filter(obj => this.requestRENIEC(obj, errors));
  }

  requestRENIEC = (person, errors = []) => {
    fetch(`http://localhost:8000/api/v1/reniec/${person.document_number}`)
    .then(resData => resData.json())
    .then(async res => {
      let { success, result, message } = res;
      if (!success) throw new Error(message);
      // actualizar la fecha de nacimiento
      await Person.query() 
        .where("id", person.id)
        .update({ date_of_birth: result.nacimiento_parse, verify: 1 });
      // ready
      console.log(`listo: ${person.id}`);
    }).catch(err => {
      console.log(`error ${person.id}`);
      errors.push(person)
    })
  }

  async handle (args, options) {
    //  this.personRandom();
    this.validarDNI();
  }
}

module.exports = ValidarDni
