const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const { MongoClient } = require('mongodb')
const { validate } = require('../lib/helpers/schema')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

describe('Helpers - Schema', () => {
  it('should validate the default settings', async () => {
    const pluginOptions = await validate({ MongoClient })

    expect(pluginOptions.MongoClient).to.equal(MongoClient)
    expect(pluginOptions.uri).to.equal('mongodb://localhost:27017/myDb')
    expect(pluginOptions.connect).to.be.true()
    expect(pluginOptions.settings.useNewUrlParser).to.be.true()
    expect(pluginOptions.settings.useUnifiedTopology).to.be.true()
    expect(pluginOptions.settings.serverApi).to.equal('1')
  })

  it('should throw error for invalid settings', async () => {
    try {
      await validate({ uri: 123 })
    } catch (err) {
      expect(err).to.exist()
      expect(err.message).to.equal('"uri" must be a string')
    }
  })

  it('should merge settings with defaults', async () => {
    const pluginOptions = await validate({
      MongoClient,
      uri: 'mongodb://localhost:27017/anotherDb'
    })

    expect(pluginOptions.MongoClient).to.equal(MongoClient)
    expect(pluginOptions.uri).to.equal('mongodb://localhost:27017/anotherDb')
    expect(pluginOptions.connect).to.be.true()
    expect(pluginOptions.settings.useNewUrlParser).to.be.true()
    expect(pluginOptions.settings.useUnifiedTopology).to.be.true()
    expect(pluginOptions.settings.serverApi).to.equal('1')
  })
})
