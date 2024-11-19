import React, {Component} from 'react';
import {useState} from 'react';
import GeolocationPermission from './GeolocationPermission.tsx';
import {ValidateUser} from './Dispatcher.tsx';

function App() {
  const validateUser = async () => {
    await ValidateUser();
  };

  GeolocationPermission().then(res => {
    if (res === true) {
      validateUser;
    }
  });
}

export default App;
