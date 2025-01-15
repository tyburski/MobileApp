import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {login} from './ApiController';
import {RootStackParamList} from './types';
import {StackNavigationProp} from '@react-navigation/stack';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleLoginClick = async () => {
    const success = await login(email, password);
    if (success) navigation.replace('Menu');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputWrapper}>
          <Text style={styles.iconText}>👤</Text>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#B0B0B0"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.iconText}>🔑</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            placeholder="Hasło"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLoginClick}>
          <Text style={styles.buttonText}>ZALOGUJ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.registerSection}>
        <Text style={styles.registerText}>Nie masz jeszcze konta?</Text>
        <TouchableOpacity
          style={styles.buttonAlt}
          onPress={() => console.log('Register clicked')}>
          <Text style={styles.buttonText}>REJESTRACJA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F5EDED',
    padding: 20,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '60%',
    height: '60%',
  },
  inputSection: {
    flex: 2,
    justifyContent: 'center',
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDED',
    borderColor: '#6482AD',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
  },
  iconText: {
    color: '#C9D1D9',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Regular',
    marginHorizontal: 10,
  },
  input: {
    height: 55,
    color: '#243642',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Regular',
  },
  button: {
    width: '100%',
    height: 55,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6482AD',
    borderRadius: 5,
  },
  buttonAlt: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243642',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Regular',
  },
  registerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 25,
  },
  registerText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 10,
  },
});
