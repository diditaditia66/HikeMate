// src/aws-exports.js

const awsconfig = {
  Auth: {
    // Pengaturan AWS Cognito
    region: 'us-east-1', // Ganti dengan region yang Anda gunakan
    userPoolId: 'us-east-1_XXXXXXXXX', // Ganti dengan User Pool ID Cognito Anda
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Ganti dengan App Client ID Cognito Anda
  },
  API: {
    // Pengaturan API Gateway (jika digunakan)
    endpoints: [
      {
        name: 'MyAPI',
        endpoint: 'https://api.example.com', // Ganti dengan URL API backend Anda
      },
    ],
  },
};

export default awsconfig;
