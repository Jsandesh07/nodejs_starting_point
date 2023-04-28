const jwt = require('jsonwebtoken');

exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
          res
            .status(401)
            .json({ success: false, message: 'User is not authorized' });
        }

        req.user = decoded;
        return next();
      });
      if (!token) {
        return next('Please login to access the data');
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: 'AuthenticationFailed',
    });
  }
};
