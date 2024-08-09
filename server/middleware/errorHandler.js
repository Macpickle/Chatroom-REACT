const appError = require('../utils/appError');

const errorHandler = (error, req, res, next) => {
    console.log(error);
    if (error instanceof appError) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
}

module.exports = errorHandler;
