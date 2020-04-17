var request = require('supertest');
var app = require('../src/app.js');
var { User } = require('../src/models/user.js');
var { userOneId, userOne, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);

//LOGIN
test('Login should fail with non existent email', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'cenas_maradas@hotmail.com',
            password: 'slb4ever' 
        })
        .expect(401);
});

test('Login should fail with non existent password', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'ricardo_energie@hotmail.com',
            password: 'hehexd'
        })
        .expect(401);
});

test('Login should work with existent user', async () => {
    var response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    //Nao uso a response pois o server, de acordo com a minha configuração no model User, não devolve o array de tokens.
    var user = await User.findById(userOneId._id);

    expect(user.tokens[1].token).toBe(response.body.token);
});

//GET PROFILE
test('Should get profile of logged user', async () => {
    var response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    expect(response.body.name).toBe('Ricardo Magalhães');
});

test('Should not get profile of not logged user', async () => {
    var response = await request(app)
        .get('/users/me')
        .send()
        .expect(401);

    expect(Object.keys(response.body).length).toBe(0);
});

//DELETE ACCOUNT
test('Should delete account for logged user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send()
        .expect(200);

    var user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete account of not logged user', async () => {
    var response = await request(app)
        .delete('/users/me')
        .send()
        .expect(401);

    expect(Object.keys(response.body).length).toBe(0);
});

//AVATAR
test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .attach('upload', 'tests/fixtures/philly.jpg')
        .expect(200);

    var user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

//UPDATE USER INFO
test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ name: 'Pablo Aimar' })
        .expect(200);

    var user = await User.findById(userOneId);
    expect(user.name).toBe('Pablo Aimar');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ location: 'Torres Vedras' })
        .expect(400);

    var user = await User.findById(userOneId);
    expect(user.location).toBe(undefined);
});

test('Should not update user password with keyword "password" ', async () => {
    var response = await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ password: '123password456' })
        .expect(400);

    expect(response.error).not.toBe(undefined);
});

test('Should not update user email with invalid email', async () => {
    var response = await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ email: 'ricardo.hotmail.com' })
        .expect(400);

    var user = await User.findById(userOneId);
    expect(response.error).not.toBe(undefined);
    expect(user.email).toBe('ricardo_energie@hotmail.com');
}); 