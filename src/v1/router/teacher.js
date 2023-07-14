const router=require('express').Router()
const teacherCtrl=require('../controller/teacher')
const auth=require('../middleWare/auth')


router.post('/teacherLogin',teacherCtrl.teacherLogin)


router.post('/logout',teacherCtrl.logout)
router.get('/getuser',auth.techAuth,teacherCtrl.getuser)
router.get('/loginStatus',teacherCtrl.loginStatus)
router.post('/remove',auth.techAuth,teacherCtrl.remove)



module.exports=router