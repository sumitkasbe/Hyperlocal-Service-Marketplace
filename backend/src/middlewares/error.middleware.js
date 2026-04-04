const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? err.isOperational
          ? err.message
          : "Something went wrong"
        : err.message,
  });
};

export default errorHandler;
