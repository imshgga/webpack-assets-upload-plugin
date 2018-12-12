const Client = require('ssh2-sftp-client')
const sftp = new Client()
const path = require('path')
const chalk = require('chalk');
const emoji = require('node-emoji')

function isFn (fn) {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

class UploadPlugin {
  constructor(options) {
    this.options = options || function noop () {}
  }

  apply (compiler) {
    const options = this.options

    compiler.hooks.done.tapAsync('uploadPlugin', function ({ compilation}, next) {
      const filenames = Object.keys(compilation.assets)
      const fileArr = filenames.map(filename => {
        let source = compilation.assets[filename].source()
        return {
          filename: filename,
          source: source
        }
      })

      if (isFn(options)) {
        options(fileArr)
      } else {
        options.port = options.port || '22'
        const remotePath = options.remotePath

        sftp.connect(options).then(() => {
          let tasks = fileArr.map(({filename, source}) => {
            let buffer = Buffer.from(source)
            return sftp.put(buffer, path.resolve(remotePath, filename))
                .then(() => {
                  console.log(emoji.get('smiley'), chalk.green(`  文件: ${filename} 已上传至服务器下${remotePath}`))
                }).catch((err) => {
                  console.log(emoji.get('rage'), chalk.red(`  文件 ${filename}上传失败了`))
                  console.log(err)
                })
          })
          Promise.all(tasks).then(() => {
            sftp.end()
          })
        }).catch((e) => {
          sftp.end()
          console.log(emoji.get('rage'), chalk.red(`连接失败了,请检查连接参数: ${JSON.stringify(options)}`))
          console.log(e)
        })
      }

      next()
    })
  }
}

module.exports = UploadPlugin
