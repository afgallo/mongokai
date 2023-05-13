![workflow](https://github.com/afgallo/mongokai/actions/workflows/main.yml/badge.svg)
[![codecov](https://codecov.io/gh/afgallo/mongokai/branch/main/graph/badge.svg?token=0OUUZBFVGC)](https://codecov.io/gh/afgallo/mongokai)

# MongoKai

Mongo 界 (MongoKai) - "Kai" means world or realm in Japanese, suggesting the connection between Hapi and MongoDB creates a new realm of possibilities.

This Hapi plugin simplifies connecting to a MongoDB database within your Hapi server. It provides seamless integration with MongoDB and allows you to easily access the MongoDB client and database objects in your server routes and extensions.

## Installation

```bash
npm i mongokai
```

## Usage

To use Mongokai, you need to register it as a plugin within your Hapi server. Here's an example of how to use it:

```javascript
const Hapi = require('@hapi/hapi')
const Mongokai = require('mongokai')
const { MongoClient } = require('mongodb')

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  })

  await server.register({
    plugin: Mongokai,
    options: {
      mongo: {
        MongoClient,
        uri: 'mongodb://localhost:27017/myDb',
        connect: true,
        settings: {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/users',
    handler: async (request, h) => {
      const users = await h.mongo.db.collection('users').find({}).toArray()
      return users
    }
  })

  await server.start()
  console.log('Server running on %s', server.info.uri)
}

init().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

In the above example, we register Mongokai as a plugin within the Hapi server. We provide the MongoDB connection settings under the mongo option, including the MongoClient from the mongodb package. Once the plugin is registered, you can access the MongoDB client and database objects in your server routes and extensions using `h.mongo.db` and `server.mongo.db`, respectively.

Make sure to replace the uri with the actual URI of your MongoDB database.

## Options

The options object for Mongokai accepts the following properties:

`mongo.MongoClient` (required): The MongoClient class from the mongodb package.

`mongo.uri` (required): The URI of the MongoDB database.

`mongo.connect` (optional, default: true): Whether to automatically connect to the MongoDB database on server startup.

`mongo.settings` (optional): Additional settings to be passed to the MongoClient constructor. For a list of available settings, refer to the official MongoDB Node.js driver documentation.

## Requirements

Node.js version 18.x.x or higher.
Hapi version 21.x.x or higher.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please create an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [license](LICENSE) file for details.
