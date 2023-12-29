'use strict'

const User = exports = module.exports = {}
const RecoveryPasswordMail = require('../Mails/RecoveryPasswordMail');
const VerifyAccount = require('../Mails/VerifyAccount');
const ChangedStateMail = require('../Mails/ChangedStateMail');
const ChangedDataMail = require('../Mails/ChangedDataMail');
const AutoResetPasswordMail = require('../Mails/AutoResetPasswordMail');


User.registered = async (user, redirect) => {
    await VerifyAccount.handle(user, redirect)
}


User.recoveryPassword = async (user, code, request) => {
    await RecoveryPasswordMail.handle(user, code, request);
}


User.changedState = async (user, request) => {
    await ChangedStateMail.handle(user, request);
}


User.changedData = async (system, user) => {
    await ChangedDataMail.handle(system, user);
}


User.autoResetPassword = async (user, password, request) => {
    await AutoResetPasswordMail.handle(user, password, request);
}