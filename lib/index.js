const { ObjectId } = require('mongodb')
const Schema = require('./helpers/schema')
const Pkg = require('../package.json')

exports.plugin = {
  name: Pkg.name,
  version: Pkg.version,
  multiple: false,
  once: true,
  requirements: {
    node: '>= 18.x.x',
    hapi: '>= 21.x.x'
  },
  register: async (server, options = {}) => {
    server.log(['mongo'], 'Registering Mongo plugin')
    let pluginOptions
    let client

    try {
      pluginOptions = await Schema.validate(options.mongo)
    } catch (e) {
      server.log(['mongo', 'error'], 'Invalid MongoDB settings')
      throw new Error(e.message)
    }

    if (!pluginOptions.connect) {
      server.log(['mongo', 'warn'], 'Will not connect to MongoDB')
      return
    }

    server.ext('onPreStart', async (srv) => {
      const { uri, settings } = pluginOptions
      client = new pluginOptions.MongoClient(uri, { ...settings })

      try {
        await client.connect()

        srv.log(['mongo'], 'Connected to MongoDB cluster')

        server.decorate('toolkit', 'mongo', { db: client.db(), client, ObjectId })
        server.decorate('server', 'mongo', { db: client.db(), client, ObjectId })
      } catch (e) {
        /* $lab:coverage:off$ */
        srv.log(['mongo', 'error'], `Failed to connect to MongoDB cluster. Error: ${e.message}`)
        throw new Error(e.message)
        /* $lab:coverage:on$ */
      }
    })

    server.ext('onPreStop', async (srv) => {
      try {
        await client?.close() // Client may not be initialised if invalid options are passed in
        srv.log(['mongo'], 'Closed MongoDB connection')
      } catch (e) {
        /* $lab:coverage:off$ */
        srv.log(['mongo', 'error'], `Failed to close MongoDB connection. Error: ${e.message}`)
        /* $lab:coverage:on$ */
      }
    })
  }
}
