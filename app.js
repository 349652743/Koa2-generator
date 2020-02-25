const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
//api
const userApi = require('./apis/user.js')
const contestApi = require('./apis/contest.js')
const loginApi = require('./apis/login.js')
const cors = require('koa2-cors');

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(cors({ //处理跨域服务 
  origin: function (ctx) {
      return '*';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(json())
app.use(logger())
// app.use(require('koa-static')(__dirname + '/public'))
app.use(require('koa-static')(__dirname + '/public/dist'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(userApi.routes(), userApi.allowedMethods())
app.use(contestApi.routes(), contestApi.allowedMethods())
app.use(loginApi.routes(), loginApi.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
