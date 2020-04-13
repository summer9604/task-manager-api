var express = require('express');
var app = express();
require('./db/mongoose.js');

var userRoutes = require('./routers/user.js');
var taskRoutes = require('./routers/task.js');

// app.use((req, res, next) => res.status(503).send('This website is under maintenence, please try again soon.'));

app.use(userRoutes);
app.use(taskRoutes);
app.use(express.json());

var port = process.env.PORT;

app.get('/*', (req, res) => res.status(404).send('Go back hehexd'));

app.listen(port, () => console.log('Server is running on port ' + port));