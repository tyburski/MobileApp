import {useState} from 'react';

export const [loginResult, setLoginResult] = useState('');
export const [token, setToken] = useState('');

export async function login(
  username: string,
  password: string,
  staySigned: boolean,
) {
  await fetch('https://xxxxxx', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password,
      staySigned: staySigned,
    }),
  })
    .then(response => response.json())
    .then(responseData => {
      setLoginResult(responseData.result);
      if (responseData.result === 'confirmed') {
        setToken(responseData.token);
      }
    });
}

function GetRoute(token: string) {}
