var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var { User } = require('../../src/models/user.js');
var { Task } = require('../../src/models/task.js');

var userOneId = new mongoose.Types.ObjectId();

var userOne = {
    _id: userOneId,
    name: 'Ricardo Magalhães',
    email: 'ricardo_energie@hotmail.com',
    password: 'slb4ever',
    age: 24,
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

var userTwoId = new mongoose.Types.ObjectId();

var userTwo = {
    _id: userTwoId,
    name: 'Pablo Aimar',
    email: 'magico10@hotmail.com',
    password: 'slb4ever',
    age: 24,
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

var taskOneId = new mongoose.Types.ObjectId();

var taskOne = {
    _id: taskOneId,
    description: 'Finish NodeJS course',
    isCompleted: false,
    owner: userOneId
};


var taskTwoId = new mongoose.Types.ObjectId();

var taskTwo = {
    _id: taskTwoId,
    description: 'Finish NodeJS course',
    isCompleted: true,
    owner: userOneId
};


var taskThreeId = new mongoose.Types.ObjectId();

var taskThree = {
    _id: taskThreeId,
    description: 'Finish NodeJS course',
    isCompleted: false,
    owner: userTwoId
};

var setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};


module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOneId,
    taskTwoId,
    taskThreeId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}