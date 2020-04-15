var express = require('express');
var sharp = require('sharp');
var router = new express.Router();
var auth = require('../middlewares/auth.js');
var upload = require('../middlewares/multer.js');
var { welcomeMessage, closeAccountMessage } = require('../emails/account.js');

router.use(express.json());

var { User } = require('../models/user.js');

router.get('/users/me', auth, async (req, res) => {

    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/users/me/avatar', auth, upload, async (req, res) => { //apagamos dest no multer para poder usar req.file.buffer e desta form usar a file info no express

    var padronizedImg = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = padronizedImg;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send(error.message);
});

router.delete('/users/me/avatar', auth, async (req, res) => {

    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.get('/users/me/avatar', auth, async (req, res) => {

    try {
        var avatar = req.user.avatar;
        res.set('Content-Type', 'image/png');
        res.send(avatar);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/users', async (req, res) => {

    try {
        var user = new User(req.body);
        var token = await user.generateAuthToken();
        welcomeMessage(user);
        res.status(201).send({ user, token }); //serve para, no postman, atribuir a mais recente token pq o user pode ter varias tokens....
    } catch (e) {
        res.status(400).send('Unable to store user.');
    }
});

router.post('/users/login', async (req, res) => {

    try {
        var user = await User.findByCredentials(req.body.email, req.body.password);

        if (user) {
            var token = await user.generateAuthToken();
            return res.status(200).send({ user, token }); //serve para, no postman, atribuir a mais recente token, pq o user pode ter varias tokens....
        }

        res.status(401).send('Wrong credentials.');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.status(200).send('User ' + req.user.name + ' logged out.');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send('All sessions from user ' + req.user.name + ' were terminated.');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.patch('/users/me', auth, async (req, res) => {

    var updates = Object.keys(req.body);
    var allowedUpdates = ['name', 'email', 'password', 'age'];

    var isValid = updates.every(update => allowedUpdates.includes(update));

    if (!isValid) return res.status(400).send('Invalid updates');

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove();
        closeAccountMessage(req.user);
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;