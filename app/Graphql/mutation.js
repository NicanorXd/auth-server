// importar Resolvers
const AuthResolver = require('./Resolvers/AuthResolver');
const UserResolver = require('./Resolvers/UserResolver');
const SisteamaResolver = require('./Resolvers/SistemaResolver');
const PersonaResolver = require('./Resolvers/PersonaResolver');

// registrar la mutaciones de la aplicacion
module.exports = {
    // ejecuar el login
    login: AuthResolver.login,
    // ejecutar logout
    logout: AuthResolver.logout,
    // activar cuenta
    verifyAcount: AuthResolver.verifyAcount,
    // ejecutar el cambio de contraseña
    changePassword: AuthResolver.changePassword,
    // recuperar contraseña
    recoveryPassword: AuthResolver.recoveryPassword,
    // restaurar contraseña
    resetPassword: AuthResolver.resetPassword,
    // ejecutar le acceso hacia otros sistemas
    authorize: AuthResolver.authorize,
    // ejecutart la creacion de usuario
    createUser: UserResolver.createUser,
    // ejecutar creacion de sistema
    createSystem: SisteamaResolver.createSystem,
    // asignacion de mutiples metodos a un usuario
    assignMetodos: UserResolver.assignMetodos,
    // creacion de personas
    createPerson: PersonaResolver.createPerson
}