const appError = require('../utils/appError');

const errorHandler = (error, req, res, next) => {
    if (error instanceof appError) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            data: error.data
        });
    } else {
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
}

module.exports = errorHandler;