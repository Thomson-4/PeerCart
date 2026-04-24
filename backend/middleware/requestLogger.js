// Structured request logger — includes authenticated userId when available.
// Replaces morgan; listens on res.finish so req.user is already populated.
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const userId = req.user?._id?.toString() ?? '-';
    process.stdout.write(
      `${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${ms}ms user=${userId}\n`
    );
  });

  next();
};

module.exports = requestLogger;
