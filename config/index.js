const path = require('path')

const REMOTE_PATH = `/usr/local/nginx/html/test_empty`
const LOCAL_PATH = path.resolve(__dirname, '../dist')

const config_aliyun = {
  host: 'igrcphdvrh-public.bastionhost.aliyuncs.com',
  port: '60022',
  username: 'lmh',
  password: '8uCJLgUR3Nz6Jwsu'
}

const config_aliyun_server = {
  host: '192.168.1.144',
  port: '22'
}

const config_local_server = {
  host: '127.0.0.1',
  port: '10144',
  username: 'root',
  password: ''
}

const config = {
  config_aliyun,
  config_aliyun_server,
  config_local_server,
  REMOTE_PATH,
  LOCAL_PATH
}

module.exports = config
