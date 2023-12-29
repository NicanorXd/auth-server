'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EntitySchema extends Schema {
  up () {
    this.create('entities', (table) => {
      table.increments()
      table.string('name').notNullable();
      table.string('slug').unique();
      table.string('logo').notNullable();
      table.string('email').notNullable();
      table.string('ruc').notNullable();
      table.string('address');
      table.boolean('state').defaultTo(true);
      table.timestamps()
    })
  }

  down () {
    this.drop('entities')
  }
}

module.exports = EntitySchema
