// custom trycatch to allow for cleaner code
exports.tryCatch = (func) => async (req, res, next) => {
    try {
        await func(req, res);
    } catch (error) {
        next(error);
    }
};