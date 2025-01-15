import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {
  pickupModel,
  refuelModel,
  borderModel,
  dropModel,
  startModel,
} from './Interfaces.tsx';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';
import {Logout} from './Dispatcher';

const navigation = useNavigation<NavigationProp<RootStackParamList>>();

const setToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};

//account
export async function login(username: string, password: string) {
  const response = await fetch(
    `http://192.168.0.101:27270/api/account/login?username=${username}&password=${password}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status === 401) {
    Alert.alert('Błędne dane logowania');
    return false;
  } else if (response.status === 200) {
    const responseData = await response.json();
    await setToken(responseData);
    return true;
  } else {
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}

//vehicle
export async function createVehicle(type: string, licensePlate: string) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const response = await fetch(
      `http://192.168.0.101:27270/api/vehicle/create?type=${type}&licensePlate=${licensePlate}`,
      {
        method: 'POST',
        headers: {
          accessToken: token,
        },
      },
    );
    console.log(response.status);
    if (response.status === 201) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można utworzyć pojazdu');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function removeVehicle(id: number) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const response = await fetch(
      `http://192.168.0.101:27270/api/delete?vehicleId=${id}`,
      {
        method: 'POST',
        headers: {
          accessToken: token,
        },
      },
    );
    if (response.status === 204) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można usunąć pojazdu');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function getVehicles() {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const headers = {accessToken: token};
    const response = await fetch(
      `http://192.168.0.101:27270/api/vehicle/getByUser`,
      {
        headers,
      },
    );
    if (response.status === 200) {
      const responseData = await response.json();
      return responseData || [];
    } else if (response.status === 400) {
      Alert.alert('Nie można pobrać listy pojazdów');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}

//company
export async function createCompany(name: string, email: string) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const response = await fetch(
      `http://192.168.0.101:27270/api/company/create?name=${name}&email=${email}`,
      {
        method: 'POST',
        headers: {
          accessToken: token,
        },
      },
    );
    if (response.status === 201) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można utworzyć firmy');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function removeCompany(id: number) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const response = await fetch(
      `http://192.168.0.101:27270/api/company/delete?companyId=${id}`,
      {
        method: 'POST',
        headers: {
          accessToken: token,
        },
      },
    );
    if (response.status === 204) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można usunąć firmy');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function getCompanies() {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const headers = {accessToken: token};
    const response = await fetch(
      `http://192.168.0.101:27270/api/company/getByUser`,
      {
        headers,
      },
    );
    if (response.status === 200) {
      const responseData = await response.json();
      return responseData || [];
    } else if (response.status === 400) {
      Alert.alert('Nie można pobrać listy firm');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}

//route
export async function newRoute(input: startModel) {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    const response = await fetch('http://192.168.0.101:27270/app/newRoute', {
      method: 'POST',
      headers: {
        accessToken: token,
      },
      body: JSON.stringify({
        vehicleId: input.vehicleId,
        companyId: input.companyId,
        latitude: input.latitude,
        longitude: input.longitude,
        country: input.country,
      }),
    });

    if (response.status === 201) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można utworzyć trasy');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function finishRoute(input: number) {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const response = await fetch(
      `http://192.168.0.101:27270/api/route/finish?routeId=${input}`,
      {
        method: 'POST',
        headers: {
          accessToken: token,
        },
      },
    );
    if (response.status === 200) {
      return true;
    } else if (response.status === 400) {
      Alert.alert('Nie można zakończyć trasy');
      return false;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
export async function newPickup(input: pickupModel) {
  const response = await fetch('http://192.168.0.101:27270/api/pickup/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: input.latitude,
      longitude: input.longitude,
      routeId: input.routeId,
      pickupCount: input.pickupCount,
      pickupWeight: input.pickupWeight,
      pickupComment: input.pickupComment,
    }),
  });

  if (response.status === 201) {
    return true;
  } else if (response.status === 400) {
    Alert.alert('Nie można utworzyć zdarzenia');
    return false;
  } else if (response.status === 401) {
    Logout(navigation);
    return false;
  } else {
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}
export async function newRefuel(input: refuelModel) {
  const response = await fetch('http://192.168.0.101:27270/api/refuel/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: input.latitude,
      longitude: input.longitude,
      routeId: input.routeId,
      refuelCount: input.refuelCount,
      refuelTotal: input.refuelTotal,
      refuelCurrency: input.refuelCurrency,
      refuelType: input.refuelType,
    }),
  });

  if (response.status === 201) {
    return true;
  } else if (response.status === 400) {
    Alert.alert('Nie można utworzyć zdarzenia');
    return false;
  } else if (response.status === 401) {
    Logout(navigation);
    return false;
  } else {
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}
export async function newBorder(input: borderModel) {
  const response = await fetch('http://192.168.0.101:27270/api/border/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: input.latitude,
      longitude: input.longitude,
      routeId: input.routeId,
      borderFrom: input.borderFrom,
      borderTo: input.borderTo,
    }),
  });

  if (response.status === 201) {
    return true;
  } else if (response.status === 400) {
    Alert.alert('Nie można utworzyć zdarzenia');
    return false;
  } else if (response.status === 401) {
    Logout(navigation);
    return false;
  } else {
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}
export async function drop(input: dropModel) {
  const response = await fetch('http://192.168.0.101:27270/api/pickup/drop', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventId: input.eventId,
      dropLatitude: input.dropLatitude,
      dropLongitude: input.dropLongitude,
    }),
  });
  if (response.status === 200) {
    return true;
  } else if (response.status === 400) {
    Alert.alert('Nie można utworzyć zdarzenia');
    return false;
  } else if (response.status === 401) {
    Logout(navigation);
    return false;
  } else {
    Alert.alert('Sprawdź połączenie z internetem');
    return false;
  }
}
export async function getRoute() {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    const headers = {accessToken: token};
    const response = await fetch(
      `http://192.168.0.101:27270/api/route/getStarted`,
      {
        headers,
      },
    );
    if (response.status === 200) {
      const responseData = await response.json();
      return responseData;
    } else if (response.status === 401) {
      Logout(navigation);
      return false;
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
      return false;
    }
  } else Logout(navigation);
}
