import { Auth } from 'aws-amplify';

export const signUp = async (username, password, email) => {
  try {
    const { user } = await Auth.signUp({
      username,
      password,
      attributes: { email },
    });
    return user;
  } catch (error) {
    console.error('Error signing up', error);
    throw error;
  }
};

export const signIn = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    return user;
  } catch (error) {
    console.error('Error signing in', error);
    throw error;
  }
};
