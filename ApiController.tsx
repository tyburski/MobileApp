import {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {jwtDecode} from 'jwt-decode';
import {Alert} from 'react-native';
import {vehicle, company, routeEvent} from './Interfaces.tsx';

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
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(
        `http://192.168.0.101:27270/app/createVehicle/${input.licensePlate}?type=${input.type}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      console.log(response.status);
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  } else return false;
}
export async function removeVehicle(id: number) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(
        `http://192.168.0.101:27270/app/deleteVehicle/${id}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      console.log(response.status);
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  } else return false;
}

export async function getVehicles() {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    console.error('token not found');
    return null;
  }

  try {
    const headers = {accessToken: token};
    const response = await fetch(`http://192.168.0.101:27270/app/vehicles`, {
      headers,
    });
    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    console.log(responseData);
    return responseData || [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return null;
  }
}

export async function createCompany(input: company) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(
        `http://192.168.0.101:27270/app/createCompany/${input.name}?email=${input.email}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  } else return false;
}

export async function removeCompany(id: number) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(
        `http://192.168.0.101:27270/app/deleteCompany/${id}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      console.log(response.status);
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  } else return false;
}

export async function getCompanies() {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    console.error('token not found');
    return null;
  }

  try {
    const headers = {accessToken: token};
    const response = await fetch(`http://192.168.0.101:27270/app/companies`, {
      headers,
    });
    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    console.log(responseData);
    return responseData || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return null;
  }
}

export async function newRoute(
  vehicleId: number | undefined,
  companyId: number | undefined,
) {
  const token = await AsyncStorage.getItem('token');

  if (vehicleId != undefined || companyId != undefined) {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/app/newRoute?vehicleId=${vehicleId}&companyId=${companyId}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );

      const res = await response.json();

      if (res > 0) {
        return res;
      }
      return 0;
    }
    return 0;
  }
  return 0;
}

export async function finishRoute(input: number) {
  const token = await AsyncStorage.getItem('token');
  console.log(token);
  if (token) {
    try {
      const response = await fetch(
        `http://192.168.0.101:27270/app/finishRoute/${input}`,
        {
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      console.log(response.status);
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);

      return false;
    }
  } else return false;
}

export async function newEvent(routeEvent: routeEvent) {
  const res = await fetch('http://192.168.0.101:27270/app/newEvent', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventName: routeEvent.eventName,
      date: routeEvent.date,
      latitude: routeEvent.latitude,
      longitude: routeEvent.longitude,
      country: routeEvent.country,
      pickupCount: routeEvent.pickupCount,
      pickupWeight: routeEvent.pickupWeight,
      pickupComment: routeEvent.pickupComment,
      dropDate: routeEvent.dropDate,
      dropLatitude: routeEvent.latitude,
      dropLongitude: routeEvent.longitude,
      refuelCount: routeEvent.refuelCount,
      refuelTotal: routeEvent.refuelTotal,
      refuelCurrency: routeEvent.refuelCurrency,
      refuelType: routeEvent.refuelType,
      borderFrom: routeEvent.borderFrom,
      borderTo: routeEvent.borderTo,
      routeId: routeEvent.routeId,
    }),
  });

  if (res.status === 200) {
    return true;
  } else return false;
}

export async function drop(routeEvent: routeEvent) {
  const res = await fetch('http://192.168.0.101:27270/app/drop', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventId: routeEvent.id,
      dropDate: routeEvent.dropDate,
      dropLatitude: routeEvent.latitude,
      dropLongitude: routeEvent.longitude,
    }),
  });
  console.log(res.status);
  if (res.status === 200) {
    return true;
  } else return false;
}

export async function getRoute() {
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    console.error('token not found');
    return null;
  }

  try {
    const headers = {accessToken: token};
    const response = await fetch(
      'http://192.168.0.101:27270/app/startedRoute',
      {
        headers,
      },
    );
    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    return responseData || [];
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}
