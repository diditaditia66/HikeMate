// src/aws-cognito-config.js
import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'ap-northeast-3_uo0e0XP3a', // Ganti dengan User Pool ID kamu
  ClientId: 'ccjs4bf1tgndab95t09m3sotd',  // Ganti dengan Client ID kamu
};

const userPool = new CognitoUserPool(poolData);

export default userPool;
