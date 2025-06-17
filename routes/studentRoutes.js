const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/add', studentController.createStudent);
router.get('/viewall', studentController.getAllStudents);
router.get('/view/:id', studentController.getStudentById);
router.put('/update/:id', studentController.updateStudent);
router.delete('/delete/:id', studentController.deleteStudent);

module.exports = router;