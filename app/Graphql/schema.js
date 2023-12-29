'use strict'

const { makeExecutableSchema } = require('graphql-tools')
const { importSchema } = require('graphql-import')
const { GraphQLUpload } = require('graphql-upload');

// types
const Query = require('./query')
const Mutation = require('./mutation')

// configuracion de graphql
const typeDefs = importSchema(__dirname + '/Types/schema.graphql')
const resolvers = { 
    Query,
    Mutation,
    // scalar para la subida de archivos
    Upload: GraphQLUpload
}

// exportar el schema
module.exports = makeExecutableSchema({ typeDefs, resolvers });