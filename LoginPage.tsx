import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Keyboard,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {login} from './ApiController';
import {RootStackParamList} from './types';
import {StackNavigationProp} from '@react-navigation/stack';

const {width, height} = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isRegistering, setIsRegistering] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideAnimHeader = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Animated.timing(slideAnimHeader, {
          toValue: isRegistering ? 0 : -height * 0.25 - 40,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(slideAnimHeader, {
          toValue: isRegistering ? 0 : 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const toggleForm = () => {
    Animated.timing(slideAnim, {
      toValue: isRegistering ? 0 : -width + 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsRegistering(!isRegistering);
  };

  const handleLoginClick = async () => {
    const success = await login(email, password);
    if (success) navigation.replace('Menu');
  };

  const handleRegisterClick = () => {
    if (name && surname && email && password && confirmPassword) {
      if (password === confirmPassword) {
        navigation.replace('Menu');
      } else {
        Alert.alert('Błąd', 'Hasła się nie zgadzają');
      }
    } else {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {transform: [{translateY: slideAnimHeader}]},
        ]}>
        <View style={styles.header}>
          <View style={styles.registerSection}>
            <TouchableOpacity style={styles.buttonAlt} onPress={toggleForm}>
              <Text style={styles.buttonText}>
                {isRegistering ? 'LOGOWANIE' : 'REJESTRACJA'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoSection}>
            <Image source={require('./assets/logo.png')} style={styles.logo} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.formContainer,
            {transform: [{translateX: slideAnim}]},
          ]}>
          <Animated.View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/arroba.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-Mail"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/padlock.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLoginClick}>
              <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/user.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Imię"
                placeholderTextColor="#B0B0B0"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/user.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nazwisko"
                placeholderTextColor="#B0B0B0"
                value={surname}
                onChangeText={setSurname}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/arroba.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-Mail"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/padlock.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Hasło"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Image
                source={require('./assets/icons/padlock.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Powtórz hasło"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegisterClick}>
              <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#F5EDED',
    padding: 10,
  },
  animatedContainer: {
    height: '130%',
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  inputSection: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDED',
    borderColor: '#0f3877',
    borderWidth: 2,
    borderRadius: 2,
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  input: {
    height: 60,
    width: '100%',
    color: '#0f3877',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Light',
  },
  button: {
    width: '100%',
    height: 60,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
    borderRadius: 2,
  },
  buttonAlt: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
    borderRadius: 2,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
  },
  registerSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    marginBottom: 10,
  },
  header: {
    height: height / 5,
    width: '100%',
    paddingHorizontal: 20,
    alignContent: 'center',
  },
  formContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    width: '200%',
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 100,
  },
});
