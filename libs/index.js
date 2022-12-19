const compressing = require('compressing')
const path = require('path')

const connect = (client, options) => {
  return new Promise((resolve, reject) => {
    client.on('ready', () => {
      resolve(client)
    })
    client.connect(options)
  })
}

const forwardOut = (connect, options) => {
  return new Promise((resolve, reject) => {
    connect.forwardOut(options.localHost, options.localPort, options.remoteHost, options.remotePort, (err, stream) => {
      if (err) {
        reject(err)
        connect.end()
        return
      }
      resolve(stream)
    })
  })
}

const createSftp = (connect) => {
  return new Promise((resolve, reject) => {
    connect.sftp((err, sftp) => {
      if (err) {
        reject(err)
        return
      }
      resolve(sftp)
    })
  })
}

const unlink = (sftp, remotePath) => {
  return new Promise((resolve, reject) => {
    sftp.unlink(remotePath, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

const readdir = (sftp, remotePath) => {
  return new Promise((resolve, reject) => {
    sftp.readdir(remotePath, (err, list) => {
      if (err) {
        reject(err)
        return
      }
      resolve(list)
    })
  })
}

const fastPut = (sftp, localPath, remotePath, options = {}) => {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, options, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(true)
    })
  })
}

const rmdir = (sftp, remotePath) => {
  return new Promise((resolve, reject) => {
    sftp.rmdir(remotePath, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

const exists = (sftp, remotePath) => {
  return new Promise((resolve, reject) => {
    sftp.exists(remotePath, (is_exists) => {
      resolve(is_exists)
    })
  })
}

const mkdir = (sftp, remotePath) => {
  return new Promise((resolve, reject) => {
    sftp.mkdir(remotePath, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

const isDir = (fileAccess) => {
  if (fileAccess[0] === 'd') return true
  return false
}

const _rmdir = async (sftp, remotePath, rmRootDir = false) => {
  // console.log(`是否存在该目录 -> ${remotePath}`)
  const is_exists = await exists(sftp, remotePath)
  if (is_exists) {
    // console.log(`存在改目录 -> ${remotePath}`)
    // console.log(`读取文件目录 -> ${remotePath}`)
    const list = await readdir(sftp, remotePath)
    const promiseList = list.map(fileItem => {
      const { longname, filename } = fileItem
      if (isDir(longname)) {
        const dirPath = `${remotePath}/${filename}`
        return _rmdir(sftp, dirPath, true)
      } else {
        const filePath = `${remotePath}/${filename}`
        return unlink(sftp, filePath)
      }
    })
    // console.log(`文件列表 -> \n`)
    // console.log(list)
    await Promise.all(promiseList)
    if (rmRootDir) {
      await rmdir(sftp, remotePath)
    }
  } else {
    // console.log(`不存在该目录 -> ${remotePath}`)
    // console.log(`创建该目录 -> ${remotePath}`)
    await mkdir(sftp, remotePath)
    // console.log(`创建目录成功 -> ${remotePath}`)
  }
  return Promise.resolve(true)
}

const compressDist = async (distPath, name) => {
  await compressing.zip.compressDir(distPath, name, { ignoreBase: true })
  return path.resolve(__dirname, '../', name)
}

const unzipRemoteSource = async (connent, sourcePath, targetPath) => {
  return new Promise(resolve => {
    const cmd = `unzip ${sourcePath} -d ${targetPath}`
    connent.shell((err, stream) => {
      if (err) throw err
      stream.on('close', () => {
        console.log('Stream :: close');
        connent.end()
      }).on('data', (data) => {
        console.log('OUTPUT: ' + data)
        if (data.indexOf('Archive') > -1) {
          resolve()
        }
      })
      stream.end(`${cmd} \n`)
    })
  })
}

exports.unzipRemoteSource = unzipRemoteSource

exports.compressDist = compressDist

exports.client = {
  connect,
  forwardOut,
  createSftp
}

exports.sftp = {
  unlink,
  readdir,
  fastPut,
  rmdir,
  exists,
  mkdir,
  _rmdir
}
