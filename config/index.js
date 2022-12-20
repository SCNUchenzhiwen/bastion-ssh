const path = require('path')

const REMOTE_PATH = `远程服务器路径`
// 本地资源文件
const LOCAL_PATH = path.resolve(__dirname, '../dist')

const config_aliyun = {
  host: '堡垒机host',
  port: '堡垒机端口号',
  username: '堡垒机用户名',
  password: '堡垒机密码'
}

const config_aliyun_server = {
  host: '远程服务器host',
  port: '22'
}

const config_local_server = {
  host: '127.0.0.1',
  port: '本地端口',
  username: '用户名',
  password: '密码'
}

const config = {
  config_aliyun,
  config_aliyun_server,
  config_local_server,
  REMOTE_PATH,
  LOCAL_PATH
}

module.exports = config
