import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import Login from './LoginPage.tsx';
import Main from './MainPage.tsx';

export async function ValidateUser() {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  if (token !== null && token !== '' && userId !== null && userId !== '') {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded?.exp < currentTime) {
      await AsyncStorage.setItem('token', '');
      await AsyncStorage.setItem('userId', '');
      return <Login />;
    } else return <Main />;
  }
  return <Login />;
}

export async function Logout() {
  await AsyncStorage.setItem('token', '');
  await AsyncStorage.setItem('userId', '');
  return <Login />;
}
