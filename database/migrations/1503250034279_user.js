'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 255).notNullable()
      table.string('token_verification').nullable()
      table.string('reset_password').nullable()
      table.integer('person_id').notNullable()
      table.string('image').notNullable()
      table.boolean('state').defaultTo(true)
      table.boolean('except').defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
