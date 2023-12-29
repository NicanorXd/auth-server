// importar los resolvers
const UserResolver = require('./Resolvers/UserResolver');
const AuthResolver = require('./Resolvers/AuthResolver');
const PersonaResolver = require('./Resolvers/PersonaResolver');

// registrar las consultas de tu aplicacion
module.exports = {
    getAuth: AuthResolver.getAuth,
    getUsers: UserResolver.getUsers,
    getPersonas: PersonaResolver.getPersonas,
    getAuthPerfiles: AuthResolver.getAuthPerfiles,
    getPersonasID: PersonaResolver.getPersonasID,
    findPersona: PersonaResolver.findPersona,
}