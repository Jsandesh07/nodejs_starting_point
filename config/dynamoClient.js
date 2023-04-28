const axios = require('axios');
const AWS = require('aws-sdk');

//for production

// async function getDynamoClient() {
//   try {
//     const roleResponse = await axios.get(
//       'http://169.254.169.254/latest/meta-data/iam/security-credentials/'
//     );
//     const role = roleResponse.data;

//     const credsResponse = await axios.get(
//       `http://169.254.169.254/latest/meta-data/iam/security-credentials/${role}`
//     );
//     const creds = credsResponse.data;

//     const config = new AWS.Config({
//       region: 'us-east-1', // replace with your region
//       accessKeyId: creds.AccessKeyId,
//       secretAccessKey: creds.SecretAccessKey,
//       sessionToken: creds.Token,
//     });

//     const docClient = new AWS.DynamoDB.DocumentClient(config);

//     return docClient;
//   } catch (error) {
//     console.error(error);
//     throw new Error('Failed to get DynamoDB client');
//   }
// }

// module.exports = { getDynamoClient };

//for dev

// *
// *
// *

const getDynamoClient = async () => {
  try {
    const creds = new AWS.SharedIniFileCredentials({ profile: 'default' });
    AWS.config.credentials = creds;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    return dynamoClient;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getDynamoClient,
};
