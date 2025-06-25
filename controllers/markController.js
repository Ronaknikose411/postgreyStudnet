const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Sequelize = require('sequelize');

// Create marks for a student
exports.createMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const { marks } = req.body;
    console.log('createMarks - Received parentId:', parentId, 'Payload:', JSON.stringify(req.body, null, 2));

    if (!parentId) return res.status(400).json({ error: 'Parent ID is required' });
    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: 'Marks must be a non-empty array of { subject, score }' });
    }

    for (const mark of marks) {
      if (!mark.subject || typeof mark.subject !== 'string' || mark.subject.trim() === '') {
        return res.status(400).json({ error: 'Each mark must have a valid subject' });
      }
      if (typeof mark.score !== 'number' || mark.score < 0 || mark.score > 100) {
        return res.status(400).json({ error: 'Each mark must have a score between 0 and 100' });
      }
    }

    const markData = marks.map(mark => ({
      subject: mark.subject.trim(),
      score: parseInt(mark.score),
      parentId: parseInt(parentId),
      name: student.name, // Include student's name
    }));

    const createdMarks = await Mark.bulkCreate(markData, { returning: true });
    console.log('Created marks:', JSON.stringify(createdMarks, null, 2));
    res.status(201).json({
      message: 'Marks created successfully',
      data: createdMarks.map(mark => ({
        id: mark.id,
        parentId: mark.parentId,
        subject: mark.subject,
        score: mark.score,
        name: mark.name,
      })),
    });
  } catch (error) {
    console.error('createMarks error:', error);
    res.status(500).json({ error: `Failed to create marks: ${error.message}` });
  }
};

// Get all marks for a student by parentId
exports.getMarksByParentId = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    console.log('getMarksByParentId - Received parentId:', parentId);

    if (!parentId) {
      return res.status(400).json({ error: 'Parent ID is required' });
    }

    const marks = await Mark.findAll({
      where: { parentId: parseInt(parentId) },
      include: [
        {
          model: Student,
          attributes: ['name'],
        },
      ],
      attributes: ['id', 'subject', 'score', 'parentId', 'name'],
    });

    if (!marks || marks.length === 0) {
      console.log(`No marks found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'No marks found for this student' });
    }

    const data = marks.map(mark => ({
      id: mark.id,
      subject: mark.subject,
      score: mark.score,
      parentId: mark.parentId,
      name: mark.Student?.name || mark.name || 'N/A',
    }));

    res.status(200).json({
      message: 'Marks retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('getMarksByParentId error:', error);
    res.status(500).json({ error: `Failed to retrieve marks: ${error.message}` });
  }
};

// Update marks for a student
exports.updateMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const { marks } = req.body;
    console.log('updateMarks - Received parentId:', parentId, 'Payload:', JSON.stringify(req.body, null, 2));

    if (!parentId) return res.status(400).json({ error: 'Parent ID is required' });
    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: 'Marks must be a non-empty array of { subject, score }' });
    }

    for (const mark of marks) {
      if (!mark.subject || typeof mark.subject !== 'string' || mark.subject.trim() === '') {
        return res.status(400).json({ error: 'Each mark must have a valid subject' });
      }
      if (typeof mark.score !== 'number' || mark.score < 0 || mark.score > 100) {
        return res.status(400).json({ error: 'Each mark must have a score between 0 and 100' });
      }
    }

    await Mark.destroy({ where: { parentId: parseInt(parentId) } });
    const markData = marks.map(mark => ({
      subject: mark.subject.trim(),
      score: parseInt(mark.score),
      parentId: parseInt(parentId),
      name: student.name, // Include student's name
    }));

    const updatedMarks = await Mark.bulkCreate(markData, { returning: true });
    console.log('Updated marks:', JSON.stringify(updatedMarks, null, 2));
    res.status(200).json({
      message: 'Marks updated successfully',
      data: updatedMarks.map(mark => ({
        id: mark.id,
        parentId: mark.parentId,
        subject: mark.subject,
        score: mark.score,
        name: mark.name,
      })),
    });
  } catch (error) {
    console.error('updateMarks error:', error);
    res.status(500).json({ error: `Failed to update marks: ${error.message}` });
  }
};

// Delete all marks for a student
exports.deleteMarks = async (req, res) => {
  try {
    const parentId = req.params.parentId;
    console.log('deleteMarks - Received parentId:', parentId);

    if (!parentId) return res.status(400).json({ error: 'Parent ID is required' });
    const student = await Student.findOne({ where: { parentId: parseInt(parentId) } });
    if (!student) {
      console.log(`Student not found for parentId: ${parentId}`);
      return res.status(404).json({ error: 'Student not found' });
    }

    const deletedCount = await Mark.destroy({ where: { parentId: parseInt(parentId) } });
    console.log(`Deleted ${deletedCount} marks for parentId: ${parentId}`);
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'No marks found for this student' });
    }

    res.status(200).json({
      message: `Successfully deleted ${deletedCount} mark(s)`,
    });
  } catch (error) {
    console.error('deleteMarks error:', error);
    res.status(500).json({ error: ` personally identifiable information delete marks: ${error.message}` });
  }
};

// Get all marks with student names
exports.getAllStudentsWithMarks = async (req, res) => {
  try {
    const marks = await Mark.findAll({
      include: [
        {
          model: Student,
          attributes: ['name'],
          required: false, // Use left join to include marks even if Student is missing
        },
      ],
      attributes: ['id', 'subject', 'score', 'parentId', 'name'],
    });

    if (!marks || marks.length === 0) {
      console.log('No marks found in the database');
      return res.status(404).json({ error: 'No marks found' });
    }

    const data = marks.map(mark => ({
      id: mark.id,
      parentId: mark.parentId,
      name: mark.Student?.name || mark.name || 'N/A',
      subject: mark.subject,
      score: mark.score,
    }));

    res.status(200).json({
      message: 'All marks retrieved successfully',
      data,
    });
  } catch (error) {
    console.error('getAllStudentsWithMarks error:', error);
    res.status(500).json({ error: `Failed to retrieve marks: ${error.message}` });
  }
};