# generate-it-typescript-client-to-server

Generate-it typescript set of tpls for browser to client api client.

Uses Axios by default but you can drop in another http service file to replace axios:

## Default lib:
```
  "scripts": {
    "generate:client": "generate-it ../ms_item_d/build/ms-item-d_1.0.0.yml -t https://github.com/acrontum/generate-it-typescript-client-to-server.git"
```
The [default http lib](https://github.com/acrontum/generate-it-typescript-client-to-server/blob/master/lib/HttpService.ts.njk) uses axios and simply calls the API and returns the promise. This default http class will not get overwritten so making changes to this file is safe. If your app consumes many apis then you will likely want to use a shared lib opposed to repeating this one each time... see below.

## Overriding the default http lib:
```
  "scripts": {
    "generate:client": "generate-it ../ms_item_d/build/ms-item-d_1.0.0.yml -t https://github.com/acrontum/generate-it-typescript-client-to-server.git -$ httpServiceImport=@/services/HttpService"
```
The default lib could very likely be too simple for your application, or you maybe you don't want to use axios. Or, which is often the case, your frontend talks to many APIs so managing the http lib from a single files is much more convenient and reduces bloat.

Just add -$ httpServiceImport=<the project import> to replace the http service with your own version and then use whichever options you need, and override exceptions as you need. 

## Overriding the base path
By default the base path is '/'. This will likely be something else if you are using aws ingress routing for example.

Override the base path example to the name of the microservice:
```
generate-it ../ms_item_d/build/ms-item-d_1.0.0.yml -t https://github.com/acrontum/generate-it-typescript-client-to-server.git -$ httpServiceImport=@/services/HttpService  -$ basePath=/ms-authentication/
```

## Example multiclient generation script
The script will build a series of API clients using these templates (defaulting to axios).

The script will also depend on an npm package `command-line-args` to parse the cli arguments allowing to control which clients point to a specific URL and which default to the base url in the http service.

For example:
Prod build
```
node buildApi.js
```
Override the channel api url:
```
node buildApi.js --local ms-channel
```

the script:
```javascript
const config = [
  {
    from: '../../backend/ms_authentication_d/build/ms-authentication-d_1.0.1.yml',
    to: 'src/api/ms-authentication'
  },
  {
    from: '../../backend/ms_image_server_cache_d/build/ms_image_server_cache_d_1.0.0.yml',
    to: 'src/api/ms-image-server-cache'
  },
  {
    from: '../../backend/ms_item_d/build/ms-item-d_1.0.0.yml',
    to: 'src/api/ms-item'
  },
  {
    from: '../../backend/ms_channel_d/build/ms-channel-d_1.0.0.yml',
    to: 'src/api/ms-channel',
  },
]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs([{ name: 'local', type: String }])
if (options.local) {
  config.forEach((conf, i) => {
    if (conf.to.includes(options.local)) {
      config[i].variables = {
        basePath: '/',
        baseUrl: 'http://localhost:8000'
      }
    } else {
      config[i].variables = {}
    }
  })
}

// eslint-disable-next-line no-undef
const generateIt = require('generate-it/build/generateIt').default
// eslint-disable-next-line no-undef
require('colors')
const generate = (configArray) => {
  if (configArray.length === 0) {
    console.log('','','Completed the generate of all apis.'.blue.bold)
  } else {
    const item = configArray.shift()
    generateIt({
      dontRunComparisonTool: false,
      dontUpdateTplCache: false,
      mockServer: false,
      segmentsCount: 1,
      swaggerFilePath: item.from,
      targetDir: item.to,
      template: 'https://github.com/acrontum/generate-it-typescript-client-to-server.git',
      variables: Object.assign({
        httpServiceImport: '@/services/HttpService',
        basePath: '/' + item.to.split('/').pop() + '/'
      }, item.variables)
    })
      .then(() => {
        console.log(`API generated: ${item.to}`.blue.bold)
        generate(configArray)
      })
      .catch((e) => {
        console.log('API generation error: ', e)
      })
  }
}

generate(config)
```
