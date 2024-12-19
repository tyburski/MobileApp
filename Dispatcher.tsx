import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {useState} from 'react';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from './types';

export async function ValidateUser() {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  console.log('token: ' + token);
  console.log('user: ' + userId);
  if (token !== null && token !== '' && userId !== null && userId !== '') {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded?.exp < currentTime) {
      await AsyncStorage.setItem('token', '');
      await AsyncStorage.setItem('userId', '');
      return false;
    } else return true;
  } else {
    return false;
  }
}

export async function Logout(navigation: NavigationProp<RootStackParamList>) {
  await AsyncStorage.setItem('token', '');
  await AsyncStorage.setItem('userId', '');
  console.log('token: ' + (await AsyncStorage.getItem('token')));
  console.log('user: ' + (await AsyncStorage.getItem('userId')));
  navigation.navigate('Login');
}
