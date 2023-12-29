"use strict";

const Route = require('../app/Services/route');

// installar metodos del sistema
Route('post', 'InstallerController.handle', false);

// archivos
Route('get', 'FileController.findFilePublic', false);
Route('get', 'FileController.findFileLocal', false);

// redirigir
Route('get', 'RedirectController.index', false);

// sede
Route('get', 'SedeController.index');
Route('post', 'SedeController.store').middleware(['jwt']);
Route('get', 'SedeController.show');

// sistema
Route('get', 'SystemController.me', false);
Route('get', 'SystemController.index').middleware(['jwt']);
Route('post', 'SystemController.store').middleware(['jwt']);
Route('get', 'SystemController.show').middleware(['jwt']);
Route('put', 'SystemController.update').middleware(['jwt']);
Route('post', 'SystemController.generateToken').middleware(['jwt']);
Route('get', 'SystemController.module').middleware(['jwt']);
Route('get', 'SystemController.method').middleware(['jwt']);

// method
Route('post', 'ModuleController.store').middleware(['jwt']);
Route('put', 'ModuleController.update').middleware(['jwt']);
Route('delete', 'ModuleController.delete').middleware(['jwt']);

// app
Route('post', 'AppController.authorize', false);
Route('get', 'AppController.me', false).middleware(['app_client', 'allow', 'jwt:auto', 'authorize']);
Route('get', 'AppController.index').middleware(['jwt']);
Route('post', 'AppController.store').middleware(['jwt']);
Route('get', 'AppController.show').middleware(['jwt']);
Route('put', 'AppController.state').middleware(['jwt']);
Route('put', 'AppController.update').middleware(['jwt']);
Route('get', 'AppController.configModule').middleware(['jwt']);
Route('get', 'AppController.block').middleware(['jwt']);

// bloqueo de apps
Route('post', 'BlockMethodAppController.store').middleware(['jwt']);
Route('delete', 'BlockMethodAppController.delete').middleware(['jwt']);


// entity
Route('get', 'EntityController.index');
Route('post', 'EntityController.store').middleware(['jwt']);
Route('get', 'EntityController.show');
Route('put', 'EntityController.update').middleware(['jwt']);

// dependencia
Route('get', 'DependenciaController.index');
Route('post', 'DependenciaController.store').middleware(['jwt']);
Route('get', 'DependenciaController.show');
Route('put', 'DependenciaController.update').middleware(['jwt']);
Route('get', 'DependenciaController.userEntity').middleware(['jwt']);
Route('get', 'DependenciaController.perfilLaboral');

// perfil laboral
Route('get', 'PerfilLaboralController.index');
Route('get', 'PerfilLaboralController.show');

// config perfil laboral
// Route.resource('config_perfil_laboral', 'ConfigPerfilLaboralController').apiOnly();

// tipo de documentos
Route('get', 'DocumentTypeController.index');

// person
Route('get', 'PersonController.index');
Route('post', 'PersonController.store').middleware(['jwt']);
Route('get', 'PersonController.show', false);
Route('get', 'PersonController.findPeople');
Route('get', 'PersonController.findPerson');
Route('put', 'PersonController.update').middleware(['jwt']);
Route('get', 'PersonController.user').middleware(['jwt']);

// auth
Route('post', 'Auth/LoginController.login');
Route('get', 'Auth/VerifyAccountController.verifyAccount', false);
Route('post', 'Auth/LogoutController.logout').middleware(['jwt']);
Route('post', 'Auth/RegisterController.register').middleware(['jwt']);
Route('get', 'Auth/AuthController.me').middleware(['jwt']);
Route('get', 'Auth/AuthController.menu').middleware(['jwt']);
Route('get', 'Auth/AuthPermissionController.handle').middleware(['jwt']);
Route('get', 'Auth/AuthPermissionController.type').middleware(['jwt']);
Route('get', 'Auth/AuthController.entity').middleware(['jwt']);
Route('get', 'Auth/AuthController.entityID').middleware(['jwt']);
Route('get', 'Auth/AuthController.dependencia').middleware(['jwt']);
Route('get', 'Auth/AuthController.dependenciaID').middleware(['jwt']);
Route('put', 'Auth/AuthController.update').middleware(['jwt']);
Route('get', 'Auth/AuthController.tokens').middleware(['jwt']);
Route('post', 'Auth/AuthController.changeImage').middleware(['jwt']);
Route('put', 'Auth/AuthController.changePassword').middleware(['jwt']);
Route('get', 'Auth/NotificationController.index').middleware(['jwt']);
Route('post', 'Auth/NotificationController.store').middleware(['jwt', 'socket']);
Route('get', 'Auth/NotificationController.show').middleware(['jwt']);
Route('put', 'Auth/NotificationController.markAsRead').middleware(['jwt']);
Route('put', 'Auth/NotificationController.markAsReadAll').middleware(['jwt']);
Route('post', 'Auth/VerifyAccountController.resendVerificationCode');
Route('post', 'Auth/RecoveryPasswordController.recoveryPassword');
Route('post', 'Auth/RecoveryPasswordController.resetPassword');

// user
Route('get', 'UserController.index').middleware(['jwt']);
Route('get', 'UserController.show').middleware(['jwt']);
Route('put', 'UserController.update').middleware(['jwt']);
Route('get', 'UserController.permissions').middleware(['jwt']);
Route('put', 'UserController.state').middleware(['jwt']);
Route('get', 'UserController.block').middleware(['jwt']);
Route('get', 'UserController.entity').middleware(['jwt']);
Route('get', 'UserController.dependencia').middleware(['jwt']);
Route('get', 'UserController.person').middleware(['jwt']);
Route('put', 'UserController.autoResetPassword').middleware(['jwt']);

// block method user
Route('post', 'BlockMethodUserController.store').middleware(['jwt']);
Route('delete', 'BlockMethodUserController.delete').middleware(['jwt']);

// permissions
Route('get', 'PermissionController.index').middleware(['jwt']);
Route('post', 'PermissionController.store').middleware(['jwt']);
Route('delete', 'PermissionController.destroy').middleware(['jwt']); 

// config entity
Route('post', 'ConfigEntityController.store').middleware(['jwt']);
Route('delete', 'ConfigEntityController.destroy').middleware(['jwt']);

// config notification
Route('get', 'ConfigNotificationController.index').middleware(['jwt']);
Route('get', 'ConfigNotificationController.show').middleware(['jwt'])

// config entity dependencia
Route('post', 'ConfigEntityDependenciaController.store').middleware(['jwt']);
Route('delete', 'ConfigEntityDependenciaController.destroy').middleware(['jwt']);

// tipo documentos
Route('get', 'PersonController.getDocumentType');

// mail
Route('post', 'MailController.to');

// audit
Route('post', 'AuditController.create').middleware(['jwt']); 

// Ruta de la Config Módule
Route('post', 'ConfigModuleController.store').middleware(['jwt']);
Route('put', 'ConfigModuleController.update').middleware(['jwt']);
Route('delete', 'ConfigModuleController.delete').middleware(['jwt']);

// code authorization
Route('post', 'CodeAuthorizationController.generate').middleware(['jwt']);
Route('put', 'CodeAuthorizationController.validate').middleware(['jwt']);

// badges
Route('get', 'BadgeController.index');
Route('get', 'BadgeController.findBadge');
Route('get', 'BadgeController.getDepartamentos');
Route('get', 'BadgeController.getProvincias');
Route('get', 'BadgeController.getDistritos');

// Apis
Route('post', 'ApiController.store').middleware(['jwt']);
Route('get', 'ApiController.getResolver');


// PUBLIC
Route('post', 'Public/PersonController.store');