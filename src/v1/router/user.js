const router=require('express').Router()
const ctrl=require('../controller/user')
const auth=require('../middleWare/auth')



router.post('/register',ctrl.register)     //////Sonarlint..Vs code install for code simplyfy using 
router.post('/loginUser',ctrl.loginUser)

router.post('/logout',ctrl.logout)
router.get('/getuser',auth.Auth,ctrl.getuser)
router.get('/loginStatus',ctrl.loginStatus)

router.post('/changepassword',auth.Auth,ctrl.changePassword)
router.post('/forgetPassword',ctrl.forgetPassword)
router.post('/resetPassword',ctrl.resetPassword)




module.exports=router