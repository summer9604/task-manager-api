var app = require('./app.js');
var port = process.env.PORT;

app.listen(port, () => console.log('Server is running on port ' + port));