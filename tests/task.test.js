var request = require('supertest');
var app = require('../src/app.js');
var { Task } = require('../src/models/task.js');
var { userOneId, userOne, taskOneId, taskOne, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase); 

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks



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

//GET TASKS
test('Should retrieve user´s tasks, according to the stablished maximum: 5', async () => {
    var response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var tasks = response.body;
    expect(tasks.length).toBe(3);
});

//GET INCOMPLETED TASKS
test('Should only retrieve incompleted tasks', async () => {
    var response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var tasks = response.body;
    expect(tasks.length).toBe(2);
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