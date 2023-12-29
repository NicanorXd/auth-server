'use strict'

const Person = exports = module.exports = {}
const CodeAutorizationMail = require('../Mails/CodeAutorizationMail');

Person.codeAuthorization = async (request, person, auth, authorization) => {
    await CodeAutorizationMail.handle(request, person, auth, authorization);
}
