'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotificationSchema extends Schema {
  up () {
    this.create('notifications', (table) => {
      table.increments()
      table.integer('send_id').notNullable();
      table.integer('receive_id').notNullable();
      table.string('title').notNullable();
      table.string('description')
      table.string('icon')
      table.string('icon_mobile')
      table.string('icon_desktop')
      table.string('image')
      table.string('url');
      table.timestamp('read_at');
      table.timestamps()
    })
  }

  down () {
    this.drop('notifications')
  }
}

module.exports = NotificationSchema
