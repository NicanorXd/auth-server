"use strict";

const User = use("App/Models/User");
const Encryption = use("Encryption");
const Env = use("Env");

const { Command } = require("@adonisjs/ace");

class CreateUserCommand extends Command {
  static get signature() {
    return `
      user:create
      { username: Ingrese el username }
      { email: Ingrese email }
      { password: Ingrese su contraseña }
      { person_id: ID Persona }
    `;
  }

  static get description() {
    return "Crear un nuevo usuario";
  }

  async handle(args, options) {
    let { username, email, password, person_id } = args;
    await User.create({
      username: `${username}@${Env.get("APP_NAME", "entidad")}`.toLowerCase(),
      email,
      password,
      person_id,
      state: 1,
    });
    // quitar password
    process.exit();
  }
}

module.exports = CreateUserCommand;
