'use strict'

const BlockMethodUser = use('App/Models/BlockMethodUser');
const { validate } = use('Validator');
const { validation } = require('validator-error-adonis');

class BlockMethodUserController {

    store = async ({ request }) => {
        try {
            // validar request
            await validation(validate, request.all(), {
                user_id: 'required',
                method_id: 'required'
            });
            // payload
            let block = await BlockMethodUser.create({
                user_id: request.input('user_id'),
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

    delete = async ({ request }) => {
        try {
            // validar request
            await validation(validate, request.all(), {
                user_id: 'required',
                method_id: 'required'
            });
            // eliminar
            await BlockMethodUser.query()
                .where('user_id', '=', request.input('user_id'))
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

module.exports = BlockMethodUserController
