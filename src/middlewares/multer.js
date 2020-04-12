var multer = require('multer');

var upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {

        var allowedFiles = ['.jpg', '.jpeg', '.png'];

        var isMatch = allowedFiles.find(element => file.originalname.endsWith(element));

        return isMatch ? cb(undefined, true) : cb(new Error('File type not accepted.'));
    }
});

module.exports = upload.single('upload');