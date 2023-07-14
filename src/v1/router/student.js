const router=require('express').Router()
const studCtrl=require('../controller/student')
const auth=require('../middleWare/auth')


router.post('/studLogin',studCtrl.studLogin)


router.post('/logout',studCtrl.logout)
router.get('/getuser',auth.techAuth,studCtrl.getuser)
router.get('/loginStatus',studCtrl.loginStatus)
router.get('/remove',auth.techAuth,studCtrl.remove)





module.exports=router