'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PermissionSchema extends Schema {
  up () {
    this.create('permissions', (table) => {
      table.increments()
      table.integer('user_id');
      table.integer('module_id');
      table.string('observation');
      table.boolean('state').defaultTo(true);
      table.unique(['user_id', 'module_id']);
      table.timestamps()
    })
  }

  down () {
    this.drop('permissions')
  }
}

module.exports = PermissionSchema
