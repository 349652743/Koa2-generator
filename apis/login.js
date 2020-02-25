const jwt = require('jsonwebtoken');
const serect = "custacm";
const Sequelize = require('sequelize');
const router = require('koa-router')()
router.prefix('/api')

const sequelize = new Sequelize('database_development', 'root', '123456', {
    host: 'localhost',
    dialect:'mysql'
});

router.post('/login',async function login(ctx, next){
console.log(ctx.request.body);
    var password = ctx.request.body.password || '';
    var username = ctx.request.body.username || '';
    //console.log(`signin with username: ${username}, password: ${password}`);
    ctx.response.type = 'application/json';
    if (username === 'root' && password === 'custcust') {
        const token = jwt.sign({
            username:username,
            password:password
        },serect,{expiresIn: '1h'});

        ctx.response.body = {token:token};
    } else {
        ctx.response.body = '';
    }
});
module.exports = router