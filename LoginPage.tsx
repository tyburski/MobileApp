import React from 'react';
import {View, TextInput, StyleSheet, Button} from 'react-native';
import {login} from './ApiController.tsx';
import {useState} from 'react';
import Main from './MainPage.tsx';
import {Alert} from 'react-native';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState(false);

  const handleLoginClick = () => {
    const log = login(username, password);
    log.then(res => {
      if (res) {
        setLoginResult(res);
      }
    });
    if (loginResult === true) {
      return <Main />;
    } else {
      Alert.alert('Nieprawidłowe dane logowania');
    }
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        onChangeText={setUsername}
        placeholder="username"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        placeholder="pssword"
      />
      <Button title="login" onPress={handleLoginClick} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
export default Login;
