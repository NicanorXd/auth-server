'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ApiSchema extends Schema {
  up () {
    this.create('apis', (table) => {
      table.increments()
      table.string('slug').notNullable().unique();
      table.string('url').notNullable();
      table.json('headers')
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('apis')
  }
}

module.exports = ApiSchema
