const jwt = require('jsonwebtoken');
const serect = "custacm";
const Sequelize = require('sequelize');
const router = require('koa-router')()
router.prefix('/api')
const sequelize = new Sequelize('database_development', 'root', '123456', {
    host: 'localhost',
    dialect:'mysql'
  });
const User = require('../models/user.js')(sequelize,Sequelize);
const Contest = require('../models/contest.js')(sequelize,Sequelize);


router.post('/addUser',async function addUser(ctx, next){//添加用户
    var token = ctx.request.body.token;
    var reqData = ctx.request.body.user;
    var resData = {status:400};
    console.log(reqData);
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        resData.status = 400;
    }
    if(decoded){//有token验证说明是管理员
        console.log(reqData);
        reqData.id = null;
        reqData.haveQueried = false;
        await User.create(reqData).then(user => {
            console.log("user's auto-generated ID:", user.id);
            resData.status = 200;
            resData.id = user.id;
        });
    }else{//没有说明是普通用户注册
        var flag = false;
        await Contest.findByPk(reqData.contestId).then(project => {
            if(project.dataValues.openRegister == true)flag = true;
            var s = project.endTime;
            s = s.replace(/-/g,"/");
            var date = new Date(s);
            var now = new Date();
            if(date<now) flag = false;//只要过了结束时间必定不能注册
        })
        if(flag){
            var count = 0;
            await User.count({ where: { studentId: reqData.studentId ,contestId : reqData.contestId}}).then(c => {
                count = c;
            })
            if(count==0){
                await User.create(reqData).then(user => {
                    console.log("user's auto-generated ID:", user.id);
                    resData.id = user.id;
                });
                resData.status = 200;
                resData.message = "注册成功";
            }else {
                resData.message = "用户已注册";
            }
        }else {
            resData.message = "比赛已关闭注册";
        }
    }
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/editUserStatus',async function editUserStatus(ctx, next){//修改用户状态
    var token = ctx.request.body.token;
    var reqData = ctx.request.body.user;
    // console.log(reqData);
    var resData = {status:400};
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        status = 400;
    }
    if(decoded){
        try{
        await User.update({ haveQueried: reqData.haveQueried }, {
            where: {
            id: reqData.id
        }
        }).then(() => {
            resData.status=200;
        });
        }catch(err){
            console.log(err);
        }   
    }
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/deleteUser',async function deleteUser(ctx, next){//删除用户
    var token = ctx.request.body.token;
    var reqData = ctx.request.body.user;
    var resData = {status:400};
    // console.log(reqData);
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        status = 400;
    }
    if(decoded){
        // console.log(reqData);
        await User.destroy({
            where: {
              id: reqData.id
            }
        }).then(() => {
            resData.status=200;
        });
    }
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/getUser',async function getUser(ctx, next){//获取用户列表
    var token = ctx.request.body.token;
    var resData = {status:400,userlist:[]};
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        status = 400;
    }
    if(decoded){
        var contestlist = [];
        await Contest.findAll().then(contests => {
            contestlist = JSON.parse(JSON.stringify(contests,null,4)); 
        });
        // console.log(contestlist);
        for(contest of contestlist){
            await User.findAll({ where: { contestId: contest.id } }).then(userlist => {
                contest.userlist  = JSON.parse(JSON.stringify(userlist,null,4)); 
            });
        }
        // console.log(contestlist);
        resData.contestlist = contestlist;
        resData.status = 200;
    }
    // console.log(resData);
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/editUser',async function editUser(ctx, next){//修改用户
    var token = ctx.request.body.token;
    var reqData = ctx.request.body.user;
    var resData = {status:400};
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        status = 400;
    }
    if(decoded){
        // console.log(reqData);
        await User.update({name:reqData.name,
            sex:reqData.sex,
            studentId:reqData.studentId,
            department:reqData.department,
            username:reqData.username,
            password:reqData.password,
            contestId:reqData.contestId,
            seatNumber:reqData.seatNumber
            }, {
            where: {
            id: reqData.id
        }
        }).then(() => {
            resData.status=200;
        });
        
    }
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/queryUser',async function queryUser(ctx, next){//查询用户
    var reqData = ctx.request.body.user;
    var resData = {status:400};
    // console.log(reqData);
    await User.findOne({where:{studentId:reqData.studentId,contestId:reqData.contestId}}).then(user => {
        var user = JSON.parse(JSON.stringify(user,null,4));
        if(!user){
            resData.message = "用户未注册";
        }else if(user.haveQueried!=true){
            resData.user = user;
            resData.status = 200;
        }else{
            resData.message = "您已经查询过了";
        }   
    });
    await User.update({ haveQueried: 1 }, {
        where: {
        studentId:reqData.studentId
    }
    });
    // console.log(resData);
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});

router.post('/allocateAccount',async function allocateAccount(ctx,next){
    var token = ctx.request.body.token;
    var reqData = ctx.request.body.userlist;
    // console.log(reqData);
    var resData = {status:400};
    try{
        var decoded = await jwt.verify(token, serect);
    }catch(err){
        status = 400;
    }
    if(decoded){
        for(var i=0;i<reqData.length;i++){
            await User.update({ username: reqData[i].username,password:reqData[i].password,seatNumber:reqData[i].seatNumber }, {
                where: {
                id:reqData[i].id
            }
            });
            resData.status = 200;
            resData.message = "所有账号分配成功";
        }
    }else {
        resData.message = "token验证失效，请重新登录";
    }
    ctx.response.type = 'application/json';
    ctx.response.body = resData;
});
module.exports = router
