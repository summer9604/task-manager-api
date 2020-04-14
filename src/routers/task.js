var express = require('express');
var auth = require('../middlewares/auth.js');
var router = new express.Router();
router.use(express.json());

var { Task } = require('../models/task.js');

router.get('/tasks', auth, async (req, res) => {

    var match = {};
    var sort = {};
    var limit = 5;

    if (req.query.completed) match.isCompleted = req.query.completed === 'true';

    if (req.query.sortBy) {
        var parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit,
                skip: limit * (parseInt(req.query.page) - 1),
                sort
            }
        }).execPopulate();
        return req.user.tasks.length > 0 ? res.status(200).send(req.user.tasks) : res.status(404).send('No tasks were found.');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/tasks', auth, async (req, res) => {

    var task = new Task({ ...req.body, owner: req.user._id });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e.message)
    }
});

router.get('/tasks/:id', auth, async (req, res) => {

    try {
        var task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
        return task ? res.status(200).send(task) : res.status(404).send('No task found.')
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {

    var updates = Object.keys(req.body);
    var allowedUpdates = ['description', 'isCompleted'];
    var isValid = updates.every(update => allowedUpdates.includes(update));

    if (!isValid) return res.status(400).send('Invalid updates');

    try {
        var task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true });
        return task ? res.status(200).send(task) : res.status(404).send('Task not found');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        var task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        return task ? res.status(200).send('Task deleted.') : res.status(404).send('Task not found.');
    } catch (e) {
        res.send(500).send(e.message);
    }
});

module.exports = router;