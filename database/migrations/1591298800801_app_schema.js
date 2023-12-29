'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AppSchema extends Schema {
  up () {
    this.create('apps', (table) => {
      table.increments()
      table.string('name').unique();
      table.string('client_id');
      table.enum('client_device', ['ANDROID', 'IOS', 'APP_DESKTOP', 'APP_WEB', 'OTRO']);
      table.string('client_secret');
      table.string('cover');
      table.string('icon');
      table.string('file');
      table.string('support_name');
      table.string('support_link');
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('apps')
  }
}

module.exports = AppSchema
