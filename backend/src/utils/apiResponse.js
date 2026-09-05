class ApiResponse {
  static success(res, data = {}, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, message = 'Operation failed', statusCode = 500, errors = null) {
    const payload = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
}

module.exports = ApiResponse;
