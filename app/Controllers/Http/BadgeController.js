'use strict'

const Badge = use('App/Models/Badge');
const Database = use('Database');

class BadgeController {

    index = async ({ request, response }) => {
        // return [];
        let badges = await Badge.query()
            .with('provincias', (build) => {
                build.groupBy('cod_dep', 'cod_pro', 'provincia')
                    .select('cod_dep', 'cod_pro', 'provincia')
            })
            .groupBy('cod_dep', 'departamento')
            .select('cod_dep', 'departamento')
            .fetch();
        return badges;
    }

    findBadge = async ({ request, response }) => {
        let  { id } = request.params;
        let type = request.input('type', 'id');
        let badge = await Badge.query()
            .where(type, id)
            .first();
        if (badge) return badge
        // response none
        return {};
    }

    getDepartamentos = async ({ request, response }) => {
        let { page } = request.all();
        let badge = await Badge.query()
            .groupBy('cod_dep', 'departamento')
            .select('cod_dep', 'departamento')
            .paginate(page || 1,20);
        // response
        return { 
            success: true,
            status: 201,
            departamento: badge
        }
    }

    getProvincias = async ({ request, response }) => {
        let { cod_dep } = request.params;
        let { page } = request.all();
        let provincia = await Badge.query()
            .where('cod_dep', cod_dep)
            .groupBy('cod_pro', 'provincia')
            .select('cod_pro', 'provincia')
            .paginate(page || 1, 20);
        // response
        return {
            success: true,
            status: 201,
            provincia
        }
    }

    getDistritos = async ({ request, response }) => {
        let { page } = request.all();
        let { cod_dep, cod_pro } = request.params;
        let distrito = await Badge.query()
            .where('cod_dep', cod_dep)
            .where('cod_pro', cod_pro)
            .groupBy('cod_dis', 'distrito')
            .select('cod_dis', 'distrito')
            .paginate(page || 1, 20);
        // response
        return { 
            success: true,
            status: 201,
            distrito
        }
    }

}

module.exports = BadgeController
