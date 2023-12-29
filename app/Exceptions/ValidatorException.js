'use strict'


const status = 402
const code = 'E_NOT_DATA_CORRECT'
const message = 'Datos incorrectos!'

class ValidatorException extends Error {
  constructor (errors) {
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = 'ValidatorException';
    this.code = code;
    this.status = status;
    this.errores = {};
    // validar errors
    let obj = {};
    // add meta_data
    errors.filter(e => {
      let newMessages = [];
      newMessages.push(e.message);
      obj[e.field] = newMessages;
    })
    this.message = JSON.stringify({ message, errors: obj });
  }
}


module.exports = ValidatorException;


