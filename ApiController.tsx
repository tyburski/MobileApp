import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  pickupModel,
  refuelModel,
  borderModel,
  dropModel,
  startModel,
  registerModel,
  finishModel,
} from './Interfaces.tsx';

const setToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};

//account
export async function login(username: string, password: string) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    const response = await fetch(
      `http://192.168.0.101:27270/api/account/login?username=${username}&password=${password}`,
      {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      const responseData = await response.json();
      await setToken(responseData);
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function getUser() {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);

  const token = await AsyncStorage.getItem('token');

  if (token) {
    try {
      const headers = {accessToken: token};
      const response = await fetch(
        `http://192.168.0.101:27270/api/account/getUser`,
        {
          headers,
        },
      );
      if (response.ok) {
        const responseData = await response.json();
        return responseData;
      } else {
        return false;
      }
    } catch {
      if (controller.signal.aborted) return false;
    }
  }
}
export async function changePassword(input: string) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/account/changePassword?password=${input}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function deleteUser() {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/account/delete`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function register(input: registerModel) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    const response = await fetch(
      'http://192.168.0.101:27270/api/account/register',
      {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: input.emailAddress,
          password: input.password,
          firstName: input.firstName,
          lastName: input.lastName,
        }),
      },
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}

//vehicle
export async function createVehicle(type: string, licensePlate: string) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/vehicle/create?type=${type}&licensePlate=${licensePlate}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function removeVehicle(id: number) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/vehicle/delete?vehicleId=${id}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function getVehicles() {
  const controller = new AbortController();
  const token = await AsyncStorage.getItem('token');

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const headers = {accessToken: token};
      const response = await fetch(
        `http://192.168.0.101:27270/api/vehicle/getByUser`,
        {
          signal: controller.signal,
          headers,
        },
      );
      if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
      } else {
        return undefined;
      }
    } else return undefined;
  } catch {
    if (controller.signal.aborted) {
      return undefined;
    }
  }
}

//company
export async function createCompany(name: string, email: string) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/company/create?name=${name}&email=${email}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function removeCompany(id: number) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/company/delete?companyId=${id}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function getCompanies() {
  const controller = new AbortController();
  const token = await AsyncStorage.getItem('token');

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const headers = {accessToken: token};
      const response = await fetch(
        `http://192.168.0.101:27270/api/company/getByUser`,
        {
          signal: controller.signal,
          headers,
        },
      );
      if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
      } else {
        return undefined;
      }
    } else return undefined;
  } catch {
    if (controller.signal.aborted) {
      return undefined;
    }
  }
}

//route
export async function newRoute(input: startModel) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    if (token) {
      const response = await fetch(
        'http://192.168.0.101:27270/api/route/start',
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            accessToken: token,
          },
          body: JSON.stringify({
            vehicleId: input.vehicleId,
            companyId: input.companyId,
            latitude: input.latitude,
            longitude: input.longitude,
            country: input.country,
          }),
        },
      );

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } else return false;
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function finishRoute(input: finishModel) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/route/finish`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            accessToken: token,
          },
          body: JSON.stringify({
            routeId: input.routeId,
            latitude: input.latitude,
            longitude: input.longitude,
            country: input.country,
          }),
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function newPickup(input: pickupModel) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    const response = await fetch(
      'http://192.168.0.101:27270/api/pickup/create',
      {
        signal: controller.signal,
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
      },
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function newRefuel(input: refuelModel) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    const response = await fetch(
      'http://192.168.0.101:27270/api/refuel/create',
      {
        signal: controller.signal,
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
      },
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function newBorder(input: borderModel) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    const response = await fetch(
      'http://192.168.0.101:27270/api/border/create',
      {
        signal: controller.signal,
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
      },
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function drop(input: dropModel) {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    const response = await fetch('http://192.168.0.101:27270/api/pickup/drop', {
      signal: controller.signal,
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

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
export async function getRoute() {
  const controller = new AbortController();
  const token = await AsyncStorage.getItem('token');

  setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    if (token) {
      const headers = {accessToken: token};
      const response = await fetch(
        `http://192.168.0.101:27270/api/route/getStarted`,
        {
          signal: controller.signal,
          headers,
        },
      );
      if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
      } else {
        return undefined;
      }
    } else return undefined;
  } catch {
    if (controller.signal.aborted) return undefined;
  }
}
export async function getRoutes() {
  const controller = new AbortController();
  const token = await AsyncStorage.getItem('token');

  setTimeout(() => {
    controller.abort();
  }, 3000);

  try {
    if (token) {
      const headers = {accessToken: token};
      const response = await fetch(
        `http://192.168.0.101:27270/api/route/getAll`,
        {
          signal: controller.signal,
          headers,
        },
      );
      if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
      } else {
        return undefined;
      }
    } else return undefined;
  } catch {
    if (controller.signal.aborted) return undefined;
  }
}
export async function generateReport(id: number, forUser: boolean) {
  const token = await AsyncStorage.getItem('token');
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, 3000);
  try {
    if (token) {
      const response = await fetch(
        `http://192.168.0.101:27270/api/report/generate?id=${id}&forUser=${forUser}`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            accessToken: token,
          },
        },
      );
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    }
  } catch {
    if (controller.signal.aborted) return false;
  }
}
