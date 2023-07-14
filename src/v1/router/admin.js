const router=require('express').Router()
const adminCtrl=require('../controller/admin')




router.post('/adminRegister',adminCtrl.addAdminIfNotFound)
router.post('/adminLogin',adminCtrl.adminLogin)


router.post('/teacherRegister',adminCtrl.teacherRegister)
router.post('/studentRegister',adminCtrl.studentRegister)

router.post('/list',adminCtrl.list)
// router.post('/remove',adminCtrl.remove)
router.post('/addSubject',adminCtrl.addSubject)
router.post('/blockedSubject',adminCtrl.blockedSubject)

router.post('/subjectList',adminCtrl.subjectList)
router.post('/removeSubject',adminCtrl.removeSubject)
router.post('/unblockedSubject',adminCtrl.unblockedSubject)










module.exports=router