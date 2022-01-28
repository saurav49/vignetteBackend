const routeHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route that you are looking for could not be found",
  });
};

module.exports = { routeHandler };
