import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

export async function login(username: string, password: string) {
  await fetch('https://xxxxxx', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then(response => response.json())
    .then(responseData => {
      if (responseData.confirmed === true) {
        setToken(responseData.token);
        setUserId(responseData.token);
        return true;
      } else return false;
    });
  return false;
}
const setToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};
const setUserId = async (token: string) => {
  const decoded = jwtDecode(token);
  if (decoded.sub && decoded?.sub) {
    await AsyncStorage.setItem('userId', decoded.sub);
  }
};

function GetRoute(token: string) {}
