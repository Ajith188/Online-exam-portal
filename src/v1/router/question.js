const router=require('express').Router()
const qstCtrl=require('../controller/question')
const auth=require('../middleWare/auth')

router.post('/addquestion',auth.techAuth,qstCtrl.addquestion)
router.post('/questionById',auth.techAuth,qstCtrl.questionById)
router.post('/updateQuestion',auth.techAuth,qstCtrl.updateQuestion)
router.post('/questionAndAnswerById',qstCtrl.questionAndAnswerById)
router.post('/changeQuestionStatus',auth.techAuth,qstCtrl.changeQuestionStatus)
router.post('/remove',auth.techAuth,qstCtrl.remove)
router.post('/questionList',qstCtrl.questionList)


module.exports=router