var request = require('supertest');
var app = require('../src/app.js');
var { Task } = require('../src/models/task.js');
var { userOne, userTwo, taskOneId, taskOne, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);

//CREATE TASK
test('Should create task for user', async () => {
    var response = await request(app)
        .post('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({
            description: 'Doing shit all day',
            isCompleted: true
        })
        .expect(201);

    var task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
});

test('Should not create task with no description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ isCompleted: false })
        .expect(400);
});

//DELETE TASK
test('Should delete task', async () => {
    await request(app)
        .delete('/tasks/' + taskOneId)
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var task = await Task.findById(taskOneId);
    expect(task).toBeNull();
});

test('Should delete task', async () => {
    await request(app)
        .delete('/tasks/' + taskOneId)
        .send()
        .expect(401);

    var task = await Task.findById(taskOneId);
    expect(task).not.toBeNull();
});

//UPDATE TASK
test('Should update a task', async () => {
    var response = await request(app)
        .patch('/tasks/' + taskOneId)
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ description: 'Hurra! O segredo agora é outro! :)' })
        .expect(200);

    var task = await Task.findById(response.body._id);
    expect(task.description).toBe('Hurra! O segredo agora é outro! :)');
});

test('Should not update task from other user', async () => {
    await request(app)
        .patch('/tasks/' + taskOneId)
        .set('Authorization', userTwo.tokens[0].token)
        .send({ description: 'Destined to fail', isCompleted: true })
        .expect(404);
});

//GET TASK
test('Should retrieve a task', async () => {
    var response = await request(app)
        .get('/tasks/' + taskOneId)
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var task = response.body;
    expect(task.description).toBe(taskOne.description);
});

test('Should not retrieve a task from other user', async () => {
    await request(app)
        .get('/tasks/' + taskOneId)
        .set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
        .send()
        .expect(404);
});

test('Should not retrieve a task without authentication', async () => {
    await request(app)
        .get('/tasks/' + taskOneId)
        .send()
        .expect(401);
});

//GET TASKS
test('Should retrieve userOne tasks, according to the stablished maximum: 5', async () => {
    var response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var tasks = response.body;
    expect(tasks.length).toBe(2);
});

//GET INCOMPLETED TASKS
test('Should only retrieve incompleted tasks', async () => {
    var response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var tasks = response.body;
    expect(tasks.length).toBe(1);
    tasks.forEach(task => expect(task.isCompleted).toBe(false));
});

//GET TASKS BY ASCENDING ORDER OF CREATION
test('Should retrieve tasks in ascending order', async () => {
    var response = await request(app)
        .get('/tasks/?sortBy=createdAt:asc')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var tasks = response.body;
    expect(tasks[0]._id).toEqual(taskOneId);
});