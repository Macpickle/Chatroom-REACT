class appError extends Error {
    constructor(errorCode, message, statusCode) {
        super(message);
        this.status = errorCode;
        this.statusCode = statusCode;
    }
}

module.exports = appError;