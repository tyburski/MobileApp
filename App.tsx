import React, {Component} from 'react';
import {useState} from 'react';
import GeolocationPermission from './GeolocationPermission.tsx';
import Main from './Main.tsx';

function App() {
  const [geolocationPermission, setGeolocationPermission] = useState<boolean>();
  const geo = GeolocationPermission();
  geo.then(res => {
    if (res) {
      setGeolocationPermission(true);
    }
  });
  if (geolocationPermission) {
    console.log('Loading - Main');
    return <Main />;
  }
}

export default App;
