'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConfigNotificationSchema extends Schema {
  up () {
    this.create('config_notifications', (table) => {
      table.increments()
      table.string('title').notNullable();
      table.string('description')
      table.string('icon')
      table.string('icon_mobile')
      table.string('icon_desktop')
      table.string('image')
      table.string('url');
      table.json('userIds');
      table.integer('method_id').notNullable().unique();
      table.boolean('except').defaultTo(false);
      table.timestamps()
    })
  }

  down () {
    this.drop('config_notifications')
  }
}

module.exports = ConfigNotificationSchema
