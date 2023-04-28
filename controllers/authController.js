const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDynamoClient } = require('../config/dynamoClient');

//const dynamoClient = getDynamoClient();

//fetch function
async function fetchUser(email) {
  const dynamoClient = await getDynamoClient();
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'User_ReportGen',
      Key: {
        Email: email,
      },
    };
    dynamoClient.get(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Item);
      }
    });
  });
}

// //get user functionality
// exports.getUsers = async (req, res, next) => {
//   res.status(200).json(req.user.user);
// };

//@desc Login user
//@route POST /api/v1/auth/login
//@access public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all the details' });
    }

    const user = await fetchUser(email);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User does not exist!!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'email or password is not valid' });
    }

    const accessToken = jwt.sign(
      {
        user: {
          Firstname: user.Firstname,
          Lastname: user.Lastname,
          Email: user.Email,
        },
      },
      process.env.SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    // res.cookie('token', accessToken, {
    //   httpOnly: false,
    // });
    const userName = user.Firstname + ' ' + user.Lastname;
    return res.status(200).json({
      success: true,
      message: 'logged in successfully!!',
      data: userName,
      accessToken,
    });
  } catch (error) {
    console.error('Error during login: ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//@desc register user
//@route POST /api/v1/auth/register
//@access public
exports.register = async (req, res) => {
  try {
    const dynamoClient = await getDynamoClient();
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'Please enter all the details' });
    }

    const user = await fetchUser(email);

    if (user) {
      return res
        .status(400)
        .json({ message: 'User already exist with the given emailId' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password.toString(), salt);

    const params = {
      TableName: 'User_ReportGen',
      Item: {
        Firstname: firstname,
        Lastname: lastname,
        Email: email,
        Password: hashPassword,
        Reports: '[]',
      },
    };

    dynamoClient.put(params, function (err, data) {
      if (err) {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'User registered successfully',
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
