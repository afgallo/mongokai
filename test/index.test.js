const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const { plugin } = require('../lib/index')
const Schema = require('../lib/helpers/schema')
const { ServerApiVersion } = require('mongodb')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code
const sandbox = Sinon.createSandbox()

describe('Mongokai', () => {
  // eslint-disable-next-line no-unused-vars
  let clientStub, closeStub, connectStub, options, server, validateStub

  beforeEach(() => {
    server = {
      log: sandbox.stub(),
      ext: sandbox.stub(),
      decorate: sandbox.stub()
    }

    options = {
      mongo: {
        MongoClient: sandbox.stub(),
        uri: 'mongodb://localhost:27017/myDb',
        connect: true,
        settings: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverApi: ServerApiVersion.v1
        }
      }
    }

    clientStub = {
      connect: sandbox.stub(),
      close: sandbox.stub(),
      db: sandbox.stub()
    }

    options.mongo.MongoClient.returns(clientStub)
    connectStub = server.ext.withArgs('onPreStart').yields(server)
    closeStub = server.ext.withArgs('onPreStop').yields(server)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should register the plugin correctly', async () => {
    await plugin.register(server, options)
    expect(server.log.calledWith(['mongo'], 'Registering Mongo plugin')).to.be.true()
    expect(server.decorate.calledTwice).to.be.true()
  })

  it('should not connect if connect option is false', async () => {
    options.mongo.connect = false
    await plugin.register(server, options)
    expect(server.log.calledWith(['mongo', 'warn'], 'Will not connect to MongoDB')).to.be.true()
    expect(connectStub.called).to.be.false()
  })

  it('should connect to MongoDB when the server starts', async () => {
    await plugin.register(server, options)
    expect(clientStub.connect.calledOnce).to.be.true()
    expect(server.log.calledWith(['mongo'], 'Connected to MongoDB cluster')).to.be.true()
  })

  it('should close the MongoDB connection when the server stops', async () => {
    await plugin.register(server, options)
    expect(clientStub.close.calledOnce).to.be.true()
    expect(server.log.calledWith(['mongo'], 'Closed MongoDB connection')).to.be.true()
  })

  it('should throw an error for invalid MongoDB settings', async () => {
    const error = new Error('Invalid MongoDB settings')
    validateStub = sandbox.stub(Schema, 'validate')
    validateStub.rejects(error)

    const { plugin: mongoPlugin } = require('../lib/index')

    const registration = mongoPlugin.register(server, options)

    await expect(registration).to.reject(Error, 'Invalid MongoDB settings')
    expect(server.log.calledWith(['mongo', 'error'], 'Invalid MongoDB settings')).to.be.true()
    expect(validateStub.calledWith(options.mongo)).to.be.true()
  })
})
