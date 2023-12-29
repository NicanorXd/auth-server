'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotificationSchema extends Schema {
  up () {
    this.table('notifications', (table) => {
      table.dropColumn('icon');
      table.dropColumn('icon_mobile');
      table.dropColumn('icon_desktop');
      table.dropColumn('url');
      table.dropColumn('read_at');
      table.json('actions');
    })
    // add read_at
    this.table('notifications', (table) => {
      table.datetime('read_at');
    });
  }

  down () {
    this.table('notifications', (table) => {
      table.string('icon');
      table.string('icon_mobile');
      table.string('icon_desktop');
      table.string('url');
      table.dropColumn('actions');
    })
  }
}

module.exports = NotificationSchema
