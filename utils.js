const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    errorMessage: message,
  });
};


module.exports = { sendError };
