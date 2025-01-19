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
  Modal,
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {login, getUser} from './ApiController';
import {RootStackParamList} from './types';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isLoadingModalError, setLoadingModalError] = useState(false);
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();

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
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    if (email === '' || password === '') {
      setLoadingModalError(true);
    }
    const success = await login(email, password);
    console.log(success);
    if (success) {
      const user = await getUser();
      if (user !== null) {
        await AsyncStorage.setItem(
          'userName',
          `${user.firstName} ${user.lastName}`,
        );
        setEmail('');
        setPassword('');
        setTimeout(() => {
          setLoadingModalVisible(false);
        }, 2000);
        setLoadingModalVisible(false);
        navigation.replace('Menu');
      } else setLoadingModalError(true);
    } else setLoadingModalError(true);
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

  const hanldeCloseLoadingModal = () => {
    setLoadingModalVisible(false);
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
      <Modal
        visible={isLoadingModalVisible}
        transparent={true}
        animationType="none">
        <View style={styles.modalContainer}>
          <View
            style={{
              ...styles.modalContent,
              backgroundColor: 'white',
              width: '50%',
              height: '30%',
            }}>
            {isLoadingModalError === false && (
              <View>
                <Animated.Image
                  source={require('./assets/icons/loading.png')}
                  style={{
                    backgroundColor: 'transparent',
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    height: '70%',
                    marginBottom: 20,
                    transform: [{rotate: spin}],
                  }}></Animated.Image>
                <Text
                  style={{
                    ...styles.modalText,
                    color: 'black',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    height: '20%',
                  }}>
                  Proszę czekać...
                </Text>
              </View>
            )}
            {isLoadingModalError === true && (
              <View>
                <Image
                  source={require('./assets/icons/danger.png')}
                  style={{
                    backgroundColor: 'transparent',
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    height: '70%',
                    marginBottom: 10,
                  }}></Image>
                <Text
                  style={{
                    ...styles.modalText,
                    color: 'black',
                    textAlign: 'center',
                    height: '10%',
                    marginBottom: 10,
                  }}>
                  Ups! Coś poszło nie tak...
                </Text>
                <TouchableOpacity
                  onPress={hanldeCloseLoadingModal}
                  style={styles.errorModalButton}>
                  <Text style={styles.errorModalButtonText}>ANULUJ</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    borderRadius: 25,
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
    width: '90%',
    color: '#0f3877',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Light',
  },
  button: {
    width: '100%',
    height: 60,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
    borderRadius: 25,
  },
  buttonAlt: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
    borderRadius: 25,
    marginTop: 15,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F5EDED',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 10,
  },
  modalText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 0,
    textAlign: 'left',
  },
  errorModalButton: {
    width: '100%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
  },
  errorModalButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
  },
});
