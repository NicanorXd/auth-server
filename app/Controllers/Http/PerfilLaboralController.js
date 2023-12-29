'use strict'

const collect = require('collect.js');

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const PerfilLaboral = use('App/Models/PerfilLaboral');

/**
 * Resourceful controller for interacting with perfillaborals
 */
class PerfilLaboralController {
  /**
   * Show a list of all perfillaborals.
   * GET perfillaborals
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  index = async ({ request }) => {
    let { page, query_search } = request.all();
    let ids = collect(request.collect(['ids'])).pluck('ids').toArray();
    let perfil_laboral = PerfilLaboral.query();
    // filtro
    if (query_search) perfil_laboral.where("nombre", "like", `%${query_search}%`)
    // filter ids
    if (ids.length) perfil_laboral.whereIn('id', ids);
    // paginate
    perfil_laboral = await perfil_laboral.paginate(page || 1, 20);
    // response
    return {
      success: true,
      status: 201,
      perfil_laboral
    };
  }

  /**
   * Create/save a new perfillaboral.
   * POST perfillaborals
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
  }

  /**
   * Display a single perfillaboral.
   * GET perfillaborals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  show = async ({ params, request }) => {
    let perfil_laboral = await PerfilLaboral.find(params.id);
    if (!perfil_laboral) throw new Error(`No se encontró el perfil laboral`);
    // response
    return {
      success: true,
      status: 201,
      perfil_laboral
    }
  }

  /**
   * Update perfillaboral details.
   * PUT or PATCH perfillaborals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a perfillaboral with id.
   * DELETE perfillaborals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = PerfilLaboralController
