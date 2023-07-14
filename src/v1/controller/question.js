const qstModel=require('../model/question')
const subjectModel=require('../model/subject')
const asyncHandler = require('express-async-handler')   /////Api is error automatic next api is excuted for express-async-handler
const userTechModel=require('../model/userTech')
const ObjectID = require('mongodb').ObjectId;


exports.addquestion = asyncHandler(async function (req, res) {
    var creator = req.user || null;
    console.log(creator)
    if (creator == null || req.user.usertype !== 'TEACHER') {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }

    //   req.check('body','Empty Question').notEmpty();
    //   req.check('marks','Invalid marks').isNumeric({min:1,max:4});
    //   req.check('options','Invalid length of list of options').isArray({min:1,max:4})
    //   req.check('explanation','Invalid Null explanation').isLength({min:1,max:256})
    //   req.check('answer','Invalid Answer').notEmpty()
    //   var errors = req.validationErrors()
    //   if(errors) {
    //     console.log(errors);
    //     res.send({
    //       success : false,
    //       message : 'Invalid inputs',
    //       errors : errors
    //     })
    //   }
    const techId = req.body.techId
    console.log(techId)
    if (!ObjectID.isValid(techId)) {
        res.send({ status: 0, message: "Invalid techId", data: [] });
        return;
    }
    const subId = req.body.subjectId
    if (!ObjectID.isValid(subId)) {
        res.send({ status: 0, message: "Invalid subjectId", data: [] });
        return;
    }
    const techr = await userTechModel.userTech.findById({ _id: techId })
    console.log("--------techr-----------", techr)
    if (techr) {
        const subjectId = await subjectModel.subject.findById({ _id: subId })
        if (subjectId && subjectId.status == "activeSubject") {
            if (techr.usertype !== "STUDENT") {
                req.body.subject = req.body.subjectId
                req.body.createdBy = req.body.techId
                const result = await qstModel.question.create(req.body)
                if (result) {
                    res.send({ status: 200, mssg: "Question created successfully", data: result })
                } else {
                    res.send({ status: 400, mssg: "Invalid field", data: [] })
                }
            } else {
                res.send({ status: 400, message: "Invalid subjectId" })
            }
        } else {
            res.send({ status: 400, message: "Invalid usertype or status" })
        }
    } else {
        res.send({ status: 400, message: "Invalid techr" })
    }


})

// exports.questionId = asyncHandler(async function (req, res) {
//     var creator = req.user || null;
//     console.log(creator)
//     if (creator == null || req.user.usertype != 'TEACHER') {
//         res.status(401).json({
//             success: false,
//             message: "Permissions not granted!"
//         })
//     }
//     const techId = req.body.techId
//     console.log(techId)
//     if (!ObjectID.isValid(techId)) {
//         res.send({ status: 0, message: "Invalid techId", data: [] });
//         return;
//     }
//     const qstId = req.user._id

//     if (!ObjectID.isValid(qstId)) {
//         res.send({ status: 0, message: "Invalid qstId", data: [] });
//         return;
//     } const techr = await userTechModel.userTech.findById({ _id: techId })
//     // console.log("--------techr-----------", techr)
//     if (techr) {
//         if (techr.usertype !== "STUDENT") {
//             const result = await qstModel.question.findById({ _id: qstId })
//             if (result) {
//                 res.send({ status: 200, mssg: "", data: result })
//             } else {
//                 res.send({ status: 400, mssg: "Invalid data", data: [] })
//             }
//         } else {
//             res.send({ status: 400, message: "Invalid usertype" })
//         }
//     } else {
//         res.send({ status: 400, message: "Invalid techr" })
//     }
// })


exports.questionById=asyncHandler(async function(req,res){
        var creator = req.user || null;
    // console.log(creator)
    if (creator == null || req.user.usertype != 'TEACHER') {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
    const techId = req.body.techId
    // console.log(techId)
    if (!ObjectID.isValid(techId)) {
        res.send({ status: 0, message: "Invalid techId", data: [] });
        return;
    }
    const tech=await userTechModel.userTech.findById({_id:techId})
    if(tech){
        const pipeline = [
            {
                $lookup: {
                    from: "userteches",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "tech"
                }
            },
            {
                $unwind: "$tech"
            },

            {
                $match: {
                    "tech._id": new ObjectID(techId)
                }
            }
        ]
        const result = await qstModel.question.aggregate(pipeline).exec()
        if (result) {
            res.send({ status: 1, mssg: "", data: result })
        } else {
            res.send({ status: 0, mssg: "", data: [] })
        }
    }else{
        res.send({status:400,mssg:"Invalid data",data:[]})
    }

})


exports.updateQuestion=asyncHandler(async function(req,res){
    var creator = req.user || null;
    // console.log(creator)
    if (creator == null || req.user.usertype != 'TEACHER') {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }

    const Id = req.body.Id
    // console.log(techId)
    if (!ObjectID.isValid(Id)) {
        res.send({ status: 0, message: "Invalid QuestionId", data: [] });
        return;
    }
    // const techId = req.body.techId
    // console.log(techId)
    // if (!ObjectID.isValid(techId)) {
    //     res.send({ status: 0, message: "Invalid techId", data: [] });
    //     return;
    // }
    // const subId = req.body.subjectId
    // if (!ObjectID.isValid(subId)) {
    //     res.send({ status: 0, message: "Invalid subjectId", data: [] });
    //     return;
    // }
    const result=await qstModel.question.findByIdAndUpdate({_id:Id},req.body,{new:true})
    if(result){
        res.send({ status: 1, mssg: "", data: result })
    }else{
        res.send({ status: 0, mssg: "", data: [] })
    }
})


exports.questionAndAnswerById = asyncHandler(async function (req, res) {
    const createdBy = req.body.createdBy
    // console.log(techId)
    if (!ObjectID.isValid(createdBy)) {
        res.send({ status: 0, message: "Invalid techId", data: [] });
        return;
    }
    const subject = req.body.subject
    if (!ObjectID.isValid(subject)) {
        res.send({ status: 0, message: "Invalid subjectId", data: [] });
        return;
    }
    const sub = await subjectModel.subject.findById({ _id: subject })
    if (sub) {
        const tech = await userTechModel.userTech.findById({ _id: createdBy })
        if (tech) {
            const pipeline = [
                {
                    $lookup: {
                        from: "userteches",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "tech"
                    }
                },
                {
                    $lookup: {
                        from: "subjects",
                        localField: "subject",
                        foreignField: "_id",
                        as: "subject"
                    }
                },
                {
                    $unwind: "$tech"
                },

                {
                    $match: {
                      $and: [
                        { "tech._id": new ObjectID(createdBy) },
                        { "subject._id": new ObjectID(subject) },
                        // Add more conditions if needed
                      ]
                    }
                  },

                // {
                //     $match: {
                //         "tech._id": new ObjectID(createdBy),
                //         "subject._id": new ObjectID(subject)
                //     }
                // },
                {
                    $project: {
                        answer: 1,
                        subject: 1,
                        body: 1
                    }
                },
            ]
            const result = await qstModel.question.aggregate(pipeline).exec()
            if (result) {
                res.send({ status: 1, mssg: "", data: result })
            } else {
                res.send({ status: 0, mssg: "", data: [] })
            }
        } else {
            res.send({ status: 400, mssg: "Invalid data", data: [] })
        }
    } else {
        res.send({ status: 400, mssg: "Invalid data", data: [] })
    }
})


// disable/enable question with ans
exports.changeQuestionStatus = asyncHandler(async function (req, res) {
    var creator = req.user || null;
    // console.log(creator)
    if (creator == null || req.user.usertype != 'TEACHER') {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }
    const Id = req.body.id
    // console.log(techId)
    if (!ObjectID.isValid(Id)) {
        res.send({ status: 0, message: "Invalid QuestionId", data: [] });
        return;
    }
    const resp = await qstModel.question.findById({ _id: Id })
    // console.log("=====resp========",resp.createdBy)
    if (resp) {
        const result = await qstModel.question.findByIdAndUpdate({ _id: Id }, { status: req.body.status, createdBy: resp.createdBy }, { new: true })
        if (result) {
            res.send({ status: 1, mssg: "", data: result })
        } else {
            res.send({ status: 0, mssg: "", data: [] })
        }
    } else {
        res.send({ status: 0, mssg: "Invalid data", data: [] })

    }
})


exports.remove = asyncHandler(async function (req, res) {
    var creator = req.user || null;
    // console.log(creator)
    if (creator == null || req.user.usertype != 'TEACHER') {
        res.status(401).json({
            success: false,
            message: "Permissions not granted!"
        })
    }

    const Id = req.body.id
    // console.log(techId)
    if (!ObjectID.isValid(Id)) {
        res.send({ status: 0, message: "Invalid QuestionId", data: [] });
        return;
    }

    const createdBy = req.body.createdBy
    // console.log(techId)
    if (!ObjectID.isValid(createdBy)) {
        res.send({ status: 0, message: "Invalid createdBy", data: [] });
        return;
    }

    const result = await qstModel.question.findOneAndDelete({ _id: Id, createdBy: createdBy })
    console.log(result)
    if (result) {
        res.send({ status: 1, mssg: "Removed data" })
    } else {
        res.send({ status: 0, mssg: "Invalid data" })
    }
})


exports.questionList = async function (req, res) {
    // try {
    let { page, limit } = req.body;
    const sortField = req.body.sortField; // Sort field parameter
    const sortOrder = req.body.sortOrder; // 'desc' or 'asc'

    const query = {};
    if (req.body.filter) {
      query.$and = req.body.filter.map(filterField => {
        const { field, value } = filterField;
        let processedValue = value;
        if (typeof value === 'string') {
          processedValue = value.toLowerCase();
          return { [field]: { $regex: new RegExp(processedValue, 'i') } };
        } else if (typeof value === 'boolean') {
          processedValue = value;
        }else if (field === 'createdAt') {
            const startDate = new Date(value);
            const endDate = new Date(value);
            endDate.setHours(23, 59, 59, 999);
            return { [field]: { $gte: startDate, $lte: endDate } };
        }
        return { [field]: processedValue };
      });
    }
    const sortObj = {};
    sortObj[sortField] = sortOrder;

    const total = await qstModel.question.countDocuments(query);
    const totalCount = await qstModel.question.countDocuments();
    const Page = Math.ceil(limit);
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * limit;

    const result = await qstModel.question.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

    if (result.length > 0) {
        res.send({ status: 1, msg: '', totalCount, filterData: total, limit: Page, currentPage, result });
    } else {
        res.send({ status: 0, msg: '', data: [] });
    }
    // } catch (error) {
    //   res.status(500).json({ error: 'Internal server error' });
    // }
}
  