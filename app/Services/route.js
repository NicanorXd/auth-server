const method = require('../../start/routes.json');
const Route = use('Route');

const getRoute = (method_name, name, isProtected = true) => {
    let r = Route[method_name](method[name].url, name);
    if (isProtected) r.middleware(['app_client', `allow:${method[name].name}`]);
    return r;
}

module.exports = getRoute; 