'use strict'

const BlockMethodApp = use('App/Models/BlockMethodApp')
const { validate } = use('Validator');
const { validation } = require('validator-error-adonis');

class BlockMethodAppController {

    /**
     * Agregar Block
     * @param {*} param0 
     */
    store = async ({ request }) => {
        try {
            // validar request
            await validation(null, request.all(), {
                app_id: 'required',
                method_id: 'required'
            });
            // payload
            let block = await BlockMethodApp.create({
                app_id: request.input('app_id'),
                method_id: request.input('method_id')
            });
            // response
            return {
                success: true,
                code: 201,
                message: "EL método se bloqueo correctamente!",
                block
            }
        } catch (error) {
            return {
                success: false,
                code: error.status || 501,
                message: error.message
            }
        }
    }

    /**
     * Eliminar block
     * @param {*} param0 
     */
    delete = async ({ params, request }) => {
        try {
            // validar request
            await validation(null, request.all(), {
                app_id: 'required',
                method_id: 'required'
            });
            // eliminar
            await BlockMethodApp.query()
                .where('app_id', '=', request.input('app_id'))
                .where('method_id', '=', request.input('method_id'))
                .delete();
            // request
            return {
                success: true,
                code: 201,
                message: "EL método se desbloqueó correctamente!"
            }
        } catch (error) {
            return {
                success: false,
                code: error.status || 501,
                message: error.message
            }
        }
    }

}

module.exports = BlockMethodAppController
