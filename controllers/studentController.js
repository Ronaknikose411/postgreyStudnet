const Student = require('../models/Student');
const Mark = require('../models/Mark');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, dateOfBirth, marks } = req.body;
    const student = await Student.create({ name, email, dateOfBirth });
    if (marks && marks.length > 0) {
      const markData = marks.map(mark => ({ ...mark, studentId: student.id }));
      await Mark.bulkCreate(markData);
    }
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all students with pagination
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single student by ID with marks
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Mark, attributes: ['subject', 'score'] }],
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, dateOfBirth, marks } = req.body;
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await student.update({ name, email, dateOfBirth });
    if (marks && marks.length > 0) {
      await Mark.destroy({ where: { studentId: student.id } });
      const markData = marks.map(mark => ({ ...mark, studentId: student.id }));
      await Mark.bulkCreate(markData);
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await student.destroy();
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};