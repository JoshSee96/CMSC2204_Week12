const express = require('express');
const app = express();
const nodemon = require('nodemon');
app.use(express.json());

//mongoDB Package
const mongoose = require('mongoose');
const { response } = require('express');

const PORT = 1200;

const dbUrl = 'mongodb+srv://admin:Password1@cluster0.broum.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(dbUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

//Mongo DB Connection

const db = mongoose.connection;

//handle DB Error, display connection

db.on('error', ()=>{
    console.error.bind(console,'connection error: ');
});

db.once('open', () => {
    console.log('MongoDB Connected');
});

//Schema/Model Declaration
require('./Models/studentObject');
require('./Models/courseObject');

const Student = mongoose.model('Student');
const Course = mongoose.model('Course');

app.get('/',(req,res) => {
    return res.status(200).json("(message: OK)");
});

app.post('/addCourse', async (req,res) => {
    try{
        let course = {
            courseInstructor: req.body.courseInstructor,
            courseCredits: req.body.courseCredits,
            courseID: req.body.courseID,
            courseName: req.body.courseName
        }
        await Course(course).save().then(c => {
            return res.status(201).json("Course Added");
        });
    }
    catch{
        return res.status(400).json("(message: Failed to Add Course - Bad Data)");
    }
});

app.get('/getAllCourses', async (req,res) => {
    try{
        let courses = await Course.find({}).lean();
        return res.status(200).json(courses);
    }
    catch{
        return res.status(400).json("(message: Failed to Access Course Data)")
    }
});

app.get('/findCourse', async (req,res) => {
    try{
        let query = req.body.courseID;
        let courses = await Course.find({"courseID" : query});
        return res.status(200).json(courses);
    }
    catch{
        return res.status(400).json("(message: Failed to Access Course Data)")
    }
});

app.post('/addStudent', async (req,res) => {
    try{
        let student = {
            fname: req.body.fname,
            lname: req.body.lname,
            studentID: req.body.studentID
        }
        await Student(student).save().then(s => {
            return res.status(201).json("Student Added");
        });
    }
    catch {
        return res.status(400).json("(message: Failed to Add Student - Bad Data)");
    }
});

app.get('/getAllStudents', async (req,res) => {
    try{
        let students = await Student.find({}).lean();
        return res.status(200).json(students);
    }
    catch{
        return res.status(400).json("(message: Failed to Access Student Data)")
    }
});

app.get('/findStudent', async (req,res) => {
    try{
        let query = req.body.fname;
        let students = await Student.find({"fname" : query});
        return res.status(200).json(students);
    }
    catch{
        return res.status(400).json("(message: Failed to Access Student Data)")
    }
});

app.post('/editStudentById', async (req,res)=>{
    try{
        let student = await Student.updateOne({_id: req.body.id},
            {fname: req.body.fname},
            {upsert: true});

        if(student)
        {
            res.status(200).json("(message: Student Edited)");
        }
        else{
            res.status(200).json("(message: No Student Changed)");
        }
    }
    catch{
        return res.status(500).json("(message: Failed to Edit Student)");
    }
});

app.post('/editStudentByFname', async (req,res)=>{
    try{
        let student = await Student.updateOne({fname: req.body.id},
            {fname: req.body.fname},
            {lname: req.body.lname},
            {upsert: true});

            if(student)
            {
                res.status(200).json("(message: Student Edited)");
            }
            else{
                res.status(200).json("(message: No Student Changed)");
            }
    }
    catch{
        return res.status(500).json("(message: Failed to Edit Student)");
    }
});

app.post('/editCourseByCourseNumber', async (req,res)=>{
    try{
        let course = await Course.updateOne({courseID: req.body.courseID},
            {courseInstructor: req.body.courseInstructor},
            {upsert: true});

            if(course)
            {
                res.status(200).json("(message: Course Edited)");
            }
            else{
                res.status(200).json("(message: No Course Changed)");
            }
    }
    catch{
        return res.status(500).json("(message: Failed to Edit Course)");
    }
});

app.post('/deleteCourseById', async (req,res)=>{
    try{
        let course = await Course.findOne({_id: req.body.id});

        if(course)
        {
            await Course.deleteOne({_id: req.body.id});
            return res.status(200).json("(message: Course Deleted)");
        }
        else{
            return res.status(200).json("(message: No Course Deleted - Query Null")
        }
    }
    catch{
        return res.status(500).json("(message: Failed to Delete Course)");
    }
});

app.post('/removeStudentFrom', async (req,res)=>{
    try{
        let student = await Student.findOneAndRemove({studentID: req.body.studentID});

        if(student)
        {
            res.status(200).json("(message: Student Removed from Classes)");
        }
        else{
            res.status(200).json("(message: No Student Removed - Query Null)");
        }
    }
    catch{
        return res.status(500).json("(message: Failed to Remove Student)");
    }
})

app.listen(PORT, () => {
    console.log(`Server Started on Port ${PORT}`);
});
