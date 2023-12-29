'user strict'

const Persona = use('App/Models/Person');
const AuthService = require('../../Services/AuthService');

class PersonaResolver {

    async getPersonas(root, { like, page }, { auth, request }) {
        return await AuthService.verify(auth, request, "getPersonas").then(async res => {
            let personas = Persona.query()
            
            if (like) {
                personas = personas.where('nombre_completo', 'like', `%${like}%`);
            }

            personas = await personas.paginate(page, 30);
            return personas.toJSON();
        }).catch(err => {
            throw new Error(err.message);
        }); 
    }

    async createPerson(root, { input }, { auth, request }) {
        try {
            let uppers = ['ape_paterno', 'ape_materno', 'nombres'];
            await this.filter(obj => input[obj].toUpperCase());
            input.nombre_completo = `${input.ape_paterno} ${input.ape_materno} ${input.nombres}`
            await Persona.create(input);

            return {
                code: "201",
                success: true,
                message: "Listo"
            }
        } catch (error) {
            return {
                code: "401",
                success: false,
                message: error.message
            }
        }
    }


    getPersonasID = async (root, { ids, page = 1 }) => {
        const personas = await Persona.query()
            .whereIn('numero_de_documento', ids)
            .paginate(page, 30);
        // obtener las personas por los ids
        return personas.toJSON();
    }


    findPersona = async (root, { id }) => {
        const persona = await Persona.findBy('numero_de_documento', id);
        return persona;
    }

}

module.exports = new PersonaResolver;