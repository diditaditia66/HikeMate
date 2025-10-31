import userPool from '../aws-cognito-config';
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

export function signUp(email, password, extra = {}) {
  const attrs = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
  ];
  if (extra.name) {
    attrs.push(new CognitoUserAttribute({ Name: 'name', Value: extra.name }));
  }

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attrs, null, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function signIn(email, password) {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  const details = new AuthenticationDetails({ Username: email, Password: password });
  return new Promise((resolve, reject) => {
    user.authenticateUser(details, {
      onSuccess: (session) => resolve({ user, session }),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut() {
  const current = userPool.getCurrentUser();
  if (current) current.signOut();
}

export function getCurrentSession() {
  const current = userPool.getCurrentUser();
  return new Promise((resolve) => {
    if (!current) return resolve(null);
    current.getSession((err, session) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve({ user: current, session });
    });
  });
}

export function confirmSignUp(email, code) {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => err ? reject(err) : resolve(result));
  });
}

export function resendConfirmationCode(email) {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  return new Promise((resolve, reject) => {
    user.resendConfirmationCode((err, result) => err ? reject(err) : resolve(result));
  });
}