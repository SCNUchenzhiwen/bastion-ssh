const { Client } = require('ssh2')
const {
  config_aliyun,
  config_aliyun_server,
  config_local_server,
  REMOTE_PATH,
  LOCAL_PATH
} = require('./config')

const { delay } = require('./utils')

const {
  client,
  sftp,
  compressDist,
  unzipRemoteSource
} = require('./libs')

const { connect, forwardOut, createSftp } = client
const {
  unlink,
  fastPut,
  _rmdir
} = sftp

const initClient = async () => {
  const bastionClient = new Client()
  const sshClient = new Client()
  console.log('开始连接堡垒机...')
  await connect(bastionClient, config_aliyun)
  console.log('连接堡垒机成功!')
  const forwardOutOptions = {
    localHost: config_local_server.host,
    localPort: config_local_server.port,
    remoteHost: config_aliyun_server.host,
    remotePort: config_aliyun_server.port
  }
  console.log('开始连接ssh服务器...')
  const stream = await forwardOut(bastionClient, forwardOutOptions)
  const sshClientOptions = {
    sock: stream,
    username: config_local_server.username,
    password: config_local_server.password
  }
  await connect(sshClient, sshClientOptions)
  console.log('连接ssh服务器成功')
  return {
    bastionClient,
    sshClient
  }
}

const initSftp = async (sshClient) => {
  console.log('连接sftp...')
  const sftpClient = await createSftp(sshClient)
  console.log('连接sftp成功!')
  return sftpClient
}

const clearRemoteDir = async (sftp) => {
  console.log('开始清空部署目录...')
  await _rmdir(sftp, REMOTE_PATH)
  console.log('清空部署目录完成')
}

const _compressDist = async () => {
  const distPath = `${LOCAL_PATH}/`
  const name = `dist.zip`
  return await compressDist(distPath, name)
}

const deploy = async (sftp, destPath) => {
  console.log(`开始上传文件...`)
  const remoteSourcePath = `${REMOTE_PATH}/dist.zip`
  await fastPut(sftp, destPath, `${REMOTE_PATH}/dist.zip`)
  console.log(`上传文件成功!`)
  return remoteSourcePath
}

const rmRemoteZipFile = async (sftp, remoteSourcePath) => {
  await unlink(sftp, remoteSourcePath)
}

const init = async () => {
  const { bastionClient, sshClient } = await initClient()
  const sftp = await initSftp(sshClient)
  await clearRemoteDir(sftp)
  const sourcePath = await _compressDist()
  const remoteSourcePath = await deploy(sftp, sourcePath)
  await unzipRemoteSource(sshClient, remoteSourcePath, `${REMOTE_PATH}/`)
  await rmRemoteZipFile(sftp, remoteSourcePath)
  sshClient.end()
  bastionClient.end()
  console.log(`部署完成!`)
}

init()
