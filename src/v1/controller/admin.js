const adminModel=require('../model/admin')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const asyncHandler = require('express-async-handler')   /////Api is error automatic next api is excuted for express-async-handler
const userTechModel=require('../model/userTech')
const ObjectID = require('mongodb').ObjectId;
const subjectModel=require('../model/subject')

const generatedToken = (id) => {
    return jwt.sign({ id }, "damalDumil", { expiresIn: "1d" })
}


exports.addAdminIfNotFound = asyncHandler(async (req,res) => {
//    const adminExits=await adminModel.findOne({'username':'sysadmin'})
      // console.log("----admin-----",admin)
    //   if(adminExits) {
    //     console.log("Admin user found");
    //   } else {
        const admin=await adminModel.Admin.create({username:"sysadmin",password:"systemadmin"})
        const token = generatedToken(admin._id)
        res.cookie('token', token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        })
        if (admin) {
            res.send({ status: 201, message: "Admin register successfully", data: admin, token })
        } else {
            res.send({ status: 400, message: "Invalid Admin" })
        }
})



exports.adminLogin = asyncHandler(async function (req, res) {
    const { username, password } = req.body
    if (!username || !password) {
        res.send({ status: 400, mssg: "Please Add email and Password" })
    }

    const admin = await adminModel.Admin.findOne({ username })
    // console.log(admin._id)
    if (!admin) {
        res.send({ status: 400, mssg: "User not found ,please signup" })
    }
    const passwordIsCorrect = await bcrypt.compare(password, admin.password)
    if (admin && passwordIsCorrect) {
        const token = generatedToken(admin._id)
        //send HTTP_only Cookie
        res.cookie('token', token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        })
        res.send({ status: 200, message: "Login successfully", data: admin })
    } else {
        res.send({ status: 400, mssg: "Invalid User or password" })
    }
})


exports.teacherRegister = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        res.send({ status: 400, message: "please fill in all required fields" })
    }
    if (password.length < 6) {
        res.send({ status: 400, message: "Password must be up to 6 characters" })
    }
    const admin = await adminModel.Admin.findById({ _id: req.body.admin_id })
    if (admin) {
        // req.body.createdBy=req.body.admin_id
        const teacherExits = await userTechModel.userTech.findOne({ email })
        if (teacherExits) {
            res.send({ status: 400, message: "Email has already been registered" })
        }
        if (req.body.usertype !== "STUDENT") {
            req.body.createdBy = req.body.admin_id
            const userTech = await userTechModel.userTech.create(req.body)
            const token = generatedToken(userTech._id)
            //send HTTP_only Cookie
            res.cookie('token', token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), //1day
                sameSite: "none",
                secure: true
            })

            if (userTech) {
                res.send({ status: 201, message: "register successfully", data: userTech, token })
            } else {
                res.send({ status: 400, message: "Invalid User" })
            }
     
        } else {
            res.send({ status: 400, message: "Invalid usertype" })
        }
    } else {
        res.send({ status: 400, message: "Invalid AdminId" })
    }
})



exports.studentRegister = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        res.send({ status: 400, message: "please fill in all required fields" })
    }
    if (password.length < 6) {
        res.send({ status: 400, message: "Password must be up to 6 characters" })
    }
    const teacherExits = await userTechModel.userTech.findOne({ email })
    if (teacherExits) {
        res.send({ status: 400, message: "Email has already been registered" })
    }
    if (req.body.usertype !== "TEACHER") {
        const userTech = await userTechModel.userTech.create(req.body)
        const token = generatedToken(userTech._id)
        //send HTTP_only Cookie
        res.cookie('token', token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1day
            sameSite: "none",
            secure: true
        })
        if (userTech) {
            res.send({ status: 201, message: "register successfully", data: userTech, token })
        } else {
            res.send({ status: 400, message: "Invalid User" })
        }
    } else {
        res.send({ status: 400, message: "Invalid usertype" })
    }
})



exports.list = async function (req, res) {
    try {
      let { page, limit } = req.body;
      const sortField = req.body.sortField; // Sort field parameter
      // const sortOrder = req.body.sortOrder === 'desc' ? 1 : -1;
      const sortOrder = req.body.sortOrder
      //  'desc' -1 : 'asc'1;
      let query = {}
      if (req.body.filter)
        query['$and'] = req.body.filter
      const sortObj = {};
      sortObj[sortField] = sortOrder;
      const total = await userTechModel.userTech.countDocuments({usertype:"TEACHER"})
      const ttl = await userTechModel.userTech.countDocuments({usertype:"STUDENT"})
      const totalCount = await userTechModel.userTech.countDocuments();
      const Page = Math.ceil(limit);
      const currentPage = parseInt(page, 10) || 1;
      const skip = (currentPage - 1) * limit;
      const result = await userTechModel.userTech.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
      if (result != 0) {
        res.send({ status: 1, msg: '', totalCount, filterData:total, filterSTUDENT:ttl , limit: Page, currentPage, result })
      } else {
        res.send({ status: 0, msg: '', data: [] });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
}

// exports.remove=asyncHandler(async function(req,res){
//     // const userId = req.body.id ? new mongoose.Types.ObjectId(req.body.id) : req.user._id
//     // console.log("----userId-----",userId, req.body.id)
//     const admin_id=req.body.admin_id
//     const userId=req.body.userId 
//     if (!ObjectID.isValid(admin_id) && !ObjectID.isValid(userId) ) {
//         res.send({ status: 0, message: "Invalid userId", data: [] });
//         return;
//       }
//     const admin = await adminModel.Admin.findById({ admin_id })
//     if (admin) {
//         const user = await userTechModel.userTech.findByIdAndDelete({userId})
//         // console.log("user", user);
//         if (user) {
//             res.send({ status: 200, mssg: "Remove the Data", })
//         } else {
//             res.send({ status: 400, mssg: "Invalid data" })
//         }
//     } else {
//         res.send({ status: 400, mssg: "Invalid admin_id" })
//     }    
// })


exports.addSubject = asyncHandler(async function (req, res) {
    const { name } = req.body
    if (!name) {
        res.send({ status: 400, message: "please fill in required fields" })
    }
    const admin_id=req.body.admin_id 
    if (!ObjectID.isValid(admin_id)  ) {
        res.send({ status: 0, message: "Invalid admin_id", data: [] });
        return;
      }
    const admin = await adminModel.Admin.findById({ _id:admin_id })
    if (admin) {
        // req.body.createdBy=req.body.admin_id
        const subjectExits = await subjectModel.subject.findOne({ name })
        if (subjectExits) {
            res.send({ status: 400, message: "Subject has already been registered" })
        }
        req.body.createdBy = req.body.admin_id
        const subject = await subjectModel.subject.create(req.body)
        if (subject) {
            res.send({ status: 201, message: "Subject Created", data: subject })
        } else {
            res.send({ status: 400, message: "Invalid Field" })
        }
    } else {
        res.send({ status: 400, message: "Invalid AdminId" })
    }
})

exports.blockedSubject = asyncHandler(async function (req, res) {
    const subjectId=req.body.sybjectId
    if (!ObjectID.isValid(subjectId)  ) {
        res.send({ status: 0, message: "Invalid subjectId", data: [] });
        return;
    }
    const admin_id=req.body.admin_id 
    if (!ObjectID.isValid(admin_id)  ) {
        res.send({ status: 0, message: "Invalid admin_id", data: [] });
        return;
      }
    const admin = await adminModel.Admin.findById({ _id:admin_id })
    if (admin) {
        // req.body.createdBy=req.body.admin_id
        req.body.createdBy = req.body.admin_id
        const subject = await subjectModel.subject.findByIdAndUpdate(subjectId, {status:"blockedSubject"}, { new: true })
        if (subject) {
            res.send({ status: 201, message: "Subject Created", data: subject })
        } else {
            res.send({ status: 400, message: "Invalid Subject" })
        }
    } else {
        res.send({ status: 400, message: "Invalid AdminId" })
    }
})

exports.subjectList = async function (req, res) {
    try {
      let { page, limit } = req.body;
      const sortField = req.body.sortField; // Sort field parameter
      // const sortOrder = req.body.sortOrder === 'desc' ? 1 : -1;
      const sortOrder = req.body.sortOrder
      //  'desc' -1 : 'asc'1;
      let query = {}
      if (req.body.filter)
        query['$and'] = req.body.filter
      const sortObj = {};
      sortObj[sortField] = sortOrder;
      const total = await subjectModel.subject.countDocuments(query)
      const totalCount = await subjectModel.subject.countDocuments();
      const Page = Math.ceil(limit);
      const currentPage = parseInt(page, 10) || 1;
      const skip = (currentPage - 1) * limit;
      const result = await subjectModel.subject.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
      if (result != 0) {
        res.send({ status: 1, msg: '', totalCount, filterData:total, limit: Page, currentPage, result })
      } else {
        res.send({ status: 0, msg: '', data: [] });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
}


exports.removeSubject=asyncHandler(async function(req,res){
    const subjectId=req.body.sybjectId
    if (!ObjectID.isValid(subjectId)  ) {
        res.send({ status: 0, message: "Invalid subjectId", data: [] });
        return;
    }
    const admin_id=req.body.admin_id 
    if (!ObjectID.isValid(admin_id)  ) {
        res.send({ status: 0, message: "Invalid admin_id", data: [] });
        return;
      }
    const admin = await adminModel.Admin.findById({ _id:admin_id })
    if (admin) {
        const subject = await subjectModel.subject.findByIdAndDelete(subjectId, { new: true })
        if (subject) {
            res.send({ status: 201, message: "Subject Removed"})
        } else {
            res.send({ status: 400, message: "Invalid Subject" })
        }
    } else {
        res.send({ status: 400, message: "Invalid AdminId" })
    }
})

exports.unblockedSubject = asyncHandler(async function (req, res) {
    const subjectId=req.body.sybjectId
    if (!ObjectID.isValid(subjectId)  ) {
        res.send({ status: 0, message: "Invalid subjectId", data: [] });
        return;
    }
    const admin_id=req.body.admin_id 
    if (!ObjectID.isValid(admin_id)  ) {
        res.send({ status: 0, message: "Invalid admin_id", data: [] });
        return;
      }
    const admin = await adminModel.Admin.findById({ _id:admin_id })
    if (admin) {
        // req.body.createdBy=req.body.admin_id
        // req.body.createdBy = req.body.admin_id
        const subject = await subjectModel.subject.findByIdAndUpdate(subjectId, {status:"unblockedSubject"}, { new: true })
        if (subject) {
            res.send({ status: 201, message: "Subject Created", data: subject })
        } else {
            res.send({ status: 400, message: "Invalid Subject" })
        }
    } else {
        res.send({ status: 400, message: "Invalid AdminId" })
    }
})
