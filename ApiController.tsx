import {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import {routeEvent} from './Interfaces.tsx';
import {Alert} from 'react-native';
import {vehicle} from './Interfaces.tsx';

const setToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};
const setUserId = async (token: string) => {
  const decoded = jwtDecode(token);
  if (decoded.sub && decoded?.sub) {
    await AsyncStorage.setItem('userId', decoded.sub);
  }
};

export async function login(username: string, password: string) {
  try {
    const response = await fetch('http://192.168.0.101:27270/account/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailAddress: username,
        password: password,
        type: 'app',
      }),
    });

    const responseData = await response.json();

    if (responseData.message) {
      return false;
    } else {
      await setToken(responseData);
      await setUserId(responseData);
      return true;
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}

export async function createVehicle(input: vehicle) {
  const userId = await AsyncStorage.getItem('userId');
  try {
    const response = await fetch('http://192.168.0.101:27270/vehicle/create', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationNumber: input.registrationNumber,
        addedDate: input.addedDate,
        vehicleType: input.vehicleType,
        selected: input.selected,
        userId: userId,
      }),
    });

    const responseData = await response.json();

    if (responseData.message) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error(error);

    return false;
  }
}

export async function getVehicles() {
  const userId = await AsyncStorage.getItem('userId');

  if (!userId) {
    console.error('User ID not found');
    return null;
  }

  try {
    const response = await fetch(
      `http://192.168.0.101:27270/vehicle/getall/${userId}`,
    );
    if (!response.ok) {
      console.error('Failed to fetch vehicles:', response.status);
      return null;
    }

    const responseData = await response.json();
    return responseData.vehicles || [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return null;
  }
}

export async function NewRoute() {
  const userId = await AsyncStorage.getItem('userId');
  const companyId = await AsyncStorage.getItem('companyId');
  await fetch('https://xxxxxx', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      companyId: companyId,
    }),
  })
    .then(response => response.json())
    .then(responseData => {
      if (responseData.routeId !== null) {
        return responseData.routeId;
      } else return null;
    });
  return null;
}

export async function FinishRoute(routeId: number) {
  await fetch('https://xxxxxx/{routeI}', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (response.status === 200) {
      return true;
    } else return false;
  });
  return false;
}

export async function NewEvent(routeId: number, routeEvent: routeEvent) {
  await fetch('https://xxxxxx', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      routeId: routeId,
      event: routeEvent,
    }),
  }).then(response => {
    if (response.status === 201) {
      return true;
    } else return false;
  });
  return false;
}

export async function GetRoute() {
  const userId = await AsyncStorage.getItem('userId');
  let response = await fetch('https://xxx/{userId}');
  let json = await response.json();
  return json;
}
