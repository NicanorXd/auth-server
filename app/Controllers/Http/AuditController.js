'use strict'

const Audit = use('App/Models/Audit');
const Method = use('App/Models/Method');
const System = use('App/Models/System');
const { validate } = use('Validator');

class AuditController {

    create = async ({ request, params }) => {
        try {
            // validar
            let validation = await validate(request.all(), {
                method_name: "required",
                token: "required"
            });
            //verificar errores
            if (validation.fails()) throw new Error("Los datos son incorrectos!");
            // obtener token
            let { token } = request.all();
            // obtenemos sistema
            let system = await System.query()
                .where('token', token)
                .first();
            // validar sistema
            if (!system) throw new Error("El sistema no es valido!");
            // obtener el method
            let method = await Method.query()
                .where('name', request.input('method_name'))
                .first();
            // validamos si existe
            if (!method) throw new Error("El modulo no existe!");
            // crear audit
            await Audit.create({
                token_id: request.$token.id,
                method_id: method.id,
                ip: request.ip(),
                observation: method.description,
                table: request.input('table', 'Unknow'),
                dirty: JSON.stringify(request.input('dirty', {})),
                obj: JSON.stringify(request.input('obj'), {}),
                action_type: method.action_type || 'OTRO'
            });
            // response
            return {
                success: true,
                code: 201,
                message: "Auditoría guardad!"
            }
        } catch (error) {
            return {
                success: false,
                code: 501,
                message: error.message
            }
        }
    }

}

module.exports = AuditController
