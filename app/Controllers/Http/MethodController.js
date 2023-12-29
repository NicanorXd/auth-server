'use strict'

const { validate } = use('Validator');
const ValidatorException = use('App/Exceptions/ValidatorException');
const System = use('App/Models/System');
const Method = use('App/Models/Method');

class MethodController {

    store = async ({ params, request }) => {
        // validar request
        let validation = await validate(request.all(), {
            token_system: "required",
            name: "required",
            action_type: "required",
            url: "required"
        })
        // revisar validación
        if (validation.fails()) throw new ValidatorException(validation.messages())
        // procesar
        try {
            // obtenemos el token
            let { token_system } = request.all();
            // obtener el sistema
            let system = await System.query()
                .where("token", token_system || "")
                .first();
            if (!system) throw new Error('El sistema es invalido!');
            // validar method
            let method = await Method.query()
                .where("name", request.input('name'))
                .where("system_id", system.id)
                .first();
            try {
                if (method) {
                    // actualizamos el method
                    method.description = request.input('description', method.description || "");
                    method.action_type = request.input('action_type', 'OTRO');
                    method.url = request.input('url', method.url);
                    await method.save();
                } else {
                    // creamos un nuevo metodo
                    method = await Method.create({
                        name: request.input('name'),
                        description: request.input('description', ''),
                        system_id: system.id,
                        action_type: request.input('action_type', 'OTRO'),
                        url: request.input('url', '')
                    });
                }
                // response
                return {
                    success: true,
                    code: 201,
                    message: "El metodo se registró correctamente!"
                }
            } catch (error) {
                throw new Error('No se pudó guardar los datos');
            }
        } catch (error) {
            return {
                success: false,
                code: 401,
                message: error.message
            }
        }
    }

}

module.exports = MethodController
