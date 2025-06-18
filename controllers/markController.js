const Mark = require('../models/Mark');
const Student = require('../models/Student');

// Create marks for a student
exports.createMarks = async (req, res) => {
  try {

    const { marks ,parentId} = req.body; // Expecting an array of { subject, score }
    
    const student = await Student.findOne({ where: { parentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!marks || !Array.isArray(marks)) {
      return res.status(400).json({ error: 'Marks must be an array of { subject, score }' });
    }

    const markData = marks.map(mark => ({
      subject: mark.subject,
      score: mark.score,
      parentId,
    }));

    const createdMarks = await Mark.bulkCreate(markData);
    res.status(201).json(createdMarks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all marks for a student by parentId
exports.getMarksByParentId = async (req, res) => {
  try {
    const marks = await Mark.findAll({
      where: { parentId: req.params.parentId },
      attributes: ['subject', 'score'],
    });
    if (!marks || marks.length === 0) {
      return res.status(404).json({ error: 'No marks found for this student' });
    }
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update marks for a student
exports.updateMarks = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { marks } = req.body; // Expecting an array of { subject, score }

    const student = await Student.findOne({ where: { parentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!marks || !Array.isArray(marks)) {
      return res.status(400).json({ error: 'Marks must be an array of { subject, score }' });
    }

    // Delete existing marks for the student
    await Mark.destroy({ where: { parentId } });

    // Create new marks
    const markData = marks.map(mark => ({
      subject: mark.subject,
      score: mark.score,
      parentId,
    }));

    const updatedMarks = await Mark.bulkCreate(markData);
    res.json(updatedMarks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete marks for a specific subject for a student
exports.deleteMarks = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { subject } = req.body;

    // Validate subject
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      return res.status(400).json({ error: 'Subject must be a non-empty string' });
    }

    const student = await Student.findOne({ where: { parentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find marks to delete (for response purposes)
    const marksToDelete = await Mark.findAll({
      where: { parentId, subject },
      attributes: ['id', 'subject', 'score', 'parentId'],
    });

    if (!marksToDelete || marksToDelete.length === 0) {
      return res.status(404).json({ error: `No marks found for subject '${subject}'` });
    }

    // Delete marks for the specified subject
    const deletedCount = await Mark.destroy({ where: { parentId, subject } });

    res.status(200).json({
      message: `Successfully deleted ${deletedCount} mark(s) for subject '${subject}'`,
      deletedMarks: marksToDelete,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students with their marks and pagination
exports.getAllStudentsWithMarks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows } = await Student.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{ model: Mark, attributes: ['subject', 'score'] }],
    });
    res.json({
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};