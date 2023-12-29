'use strict'

const User = use('App/Models/User');
const Encryption = use('Encryption');

const { Command } = require('@adonisjs/ace')

class DecryptPassword extends Command {
  static get signature () {
    return 'decrypt:password { email: Ingrese el email }'
  }

  static get description () {
    return 'Mostrar contraseña sifrada en text plano'
  }

  async handle (args, options) {
    let { email } = args;
    let user = await User.findBy('email', email || "");
    if (!user) return this.error("El usuario no existe!!!");
    try {
      const passwordPlain = await Encryption.decrypt(user.password);
      this.success(passwordPlain);
    } catch (error) {
      this.error(error.message);
    }
    // quitar password
    process.exit();
  }
}

module.exports = DecryptPassword
