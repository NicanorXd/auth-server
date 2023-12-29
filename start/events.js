
const Event = use('Event')


// eventos del usuario o el auth
Event.on('user::registered', 'User.registered')
Event.on('user::recoveryPassword', 'User.recoveryPassword')
Event.on('user::changedState', 'User.changedState');
Event.on('user::changedData', 'User.changedData');
Event.on('user::autoResetPassword', 'User.autoResetPassword');

// eventos del sistema
Event.on("new::sistema", 'Sistema.registered')


// manejar notificaciones automaticas disparadas por un method especifico
Event.on("allow::notification", 'HandleMethod.notification')


// eventos de la persona
Event.on("person::codeAuthorization", 'Person.codeAuthorization');