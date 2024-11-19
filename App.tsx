import React, {Component} from 'react';
import {useState} from 'react';
import GeolocationPermission from './GeolocationPermission.tsx';
import Main from './MainPage.tsx';
import Login from './LoginPage.tsx';
import {ValidateToken} from './ValidateToken.tsx';

function App() {
  const [geolocationPermission, setGeolocationPermission] = useState<boolean>();
  const geo = GeolocationPermission();
  const [tokenValid, setTokenValid] = useState(false);

  geo.then(res => {
    if (res) {
      setGeolocationPermission(true);
    }
  });
  const validateToken = async () => {
    const result = await ValidateToken();
    setTokenValid(result);
  };
  if (geolocationPermission) {
    validateToken;
    if (tokenValid === true) {
      return <Main />;
    } else return <Login />;
  }
}

export default App;
