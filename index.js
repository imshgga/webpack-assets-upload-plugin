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


    if (compiler.hooks && compiler.hooks.done && compiler.hooks.done.tapAsync) {
      compiler.hooks.done.tapAsync('uploadPlugin', uploadTask)
    } else if (compiler.plugin) {
      compiler.plugin('done', uploadTask)
    }

    function uploadTask ({ compilation}, callback) {
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
            return sftp.put(buffer, path.join(remotePath, filename).split(path.sep).join('/'))
                .then(() => {
                  console.log(emoji.get('smiley'), chalk.green(`文件: ${filename} 已上传至服务器下${remotePath}`))
                }).catch((err) => {
                  console.log(emoji.get('rage'), chalk.red(`文件 ${filename}上传失败了`))
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

      callback && callback()
    }

  }
}

module.exports = UploadPlugin
