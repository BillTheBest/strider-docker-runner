
var init = require('../lib/init')
var createSlave = require('../lib/slave')

if (!process.env.DOCKER_IP) {
  console.log('Need to specify DOCKER_IP and DOCKER_PORT')
  process.exit(1)
}

function run(spawn, command, args, done) {
  spawn(command, args, {}, function (err, proc) {
    if (err) {
      throw err
    }
    proc.stderr.on('data', function (data) {
      console.log('[err]', data.toString())
    })
    proc.stdout.on('data', function (data) {
      console.log('[out]', data.toString())
    })
    proc.on('exit', function (code) {
      console.log('[exit] with', code)
      done(code)
    })
  })
}

init({}, function (err, docker) {
  createSlave(docker, {
    image: 'strider/strider-docker-slave'
  }, function (err, spawn, kill) {
    if (err) {
      throw err
    }
    var command = 'git'
    var args = ['clone', 'https://github.com/notablemind/loco.git', '.']
    run(spawn, command, args, function () {
      run(spawn, 'echo', ['hello'], function () {
        process.exit(0)
      })
    })
  })
})
