const Joi = require('joi')
const { merge } = require('@hapi/hoek')
const { ServerApiVersion } = require('mongodb')

const defaultPluginSettings = {
  uri: 'mongodb://localhost:27017/myDb',
  connect: true,
  settings: {
    serverApi: ServerApiVersion.v1
  }
}

const schema = Joi.object({
  MongoClient: Joi.function().required(),
  uri: Joi.string().required().default(defaultPluginSettings.uri),
  connect: Joi.bool().default(defaultPluginSettings.connect),
  settings: Joi.object().default(defaultPluginSettings.settings)
})

exports.validate = async (mongoDbOptions) => {
  const pluginOptions = merge(defaultPluginSettings, mongoDbOptions)
  await schema.validateAsync(pluginOptions)
  return pluginOptions
}
