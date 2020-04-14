var request = require('supertest');
var app = require('../src/app.js');
var { User } = require('../src/models/user.js');
var { userOneId, userOne, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated



//LOGIN
test('Login should fail with non existent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'cenas_maradas@hotmail.com',
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

test('Should not delete account for logged user', async () => {
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

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + userOne.tokens[0].token)
        .send({ location: 'Torres Vedras' })
        .expect(400);

    var user = await User.findById(userOneId);
    expect(user.location).toBe(undefined);
}); 