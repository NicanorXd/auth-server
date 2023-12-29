'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SistemaSchema extends Schema {
  up () {
    this.create('systems', (table) => {
      table.increments()
      table.string('name').unique()
      table.string('alias').unique()
      table.text('description').nullable()
      table.string('email')
      table.string('icon')
      table.string('icon_mobile')
      table.string('icon_desktop')
      table.string('image')
      table.string('path')
      table.string("token").unique()
      table.string('support_name').defaultTo('CCFFigueroa');
      table.string('support_link');
      table.string('support_email').defaultTo('twd2206@gmail.com');
      table.string('version')
      table.string('config_mail_connection')
      table.json('config_mail_data')
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('systems')
  }
}

module.exports = SistemaSchema
