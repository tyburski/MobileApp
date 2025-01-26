import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

export async function ValidateUser() {
  const token = await AsyncStorage.getItem('token');
  if (token !== null && token !== '') {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded?.exp < currentTime) {
      await AsyncStorage.setItem('token', '');
      return false;
    } else return true;
  } else {
    return false;
  }
}

export function Currency(input: string | null) {
  if (input === 'EURO') return '€';
  if (input === 'PLN') return 'Zł';
  if (input === 'KORONY_CZESKIE') return 'Kč';
}
