const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Error has occured, see errorMessage for more details",
    errorMessage: err.message,
  });
};

module.exports = { errorHandler };
