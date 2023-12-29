'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HelpsSchema extends Schema {
  up () {
    this.create('helps', (table) => {
      table.increments()
      table.string('title').notNullable()
      table.string('description').notNullable()
      table.string('slug').unique()
      table.string('icon')
      table.integer('app_id').notNullable()
      table.boolean('state').defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('helps')
  }
}

module.exports = HelpsSchema
