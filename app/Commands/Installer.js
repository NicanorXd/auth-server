'use strict'

const { Command } = require('@adonisjs/ace')
const InstallerController = require('../Controllers/Http/InstallerController');
const Env = use('Env');
const routes = require('../../start/routes.json');

class Installer extends Command {
  static get signature () {
    return 'installer:method'
  }

  static get description () {
    return 'Instalar métodos del sistema'
  }

  async handle (args, options) {
    let install = new InstallerController();
    let SystemSecret = Env.get('SYSTEM_KEY');
    let storage = []; 
    await Object.keys(routes).map(key => {
      let method = routes[key];
      storage.push(method);
    });
    // registrar métodos
    let response = await install.register(SystemSecret, storage);
    if (response.success) this.success(response.message);
    else this.error(response.message);
    process.exit();
  }
}

module.exports = Installer
