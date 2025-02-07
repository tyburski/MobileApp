import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {changePassword, deleteUser} from './ApiController';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function SettingsPage() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLoadingModalError, setLoadingModalError] = useState(true);

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

  const handleChangePasswordClick = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('', 'Wszystkie pola są wymagane.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('', 'Wprowadzone hasła nie są takie same.');
      return;
    }
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const result = await changePassword(password);
    if (result === true) {
      setLoadingModalVisible(false);
      setPassword('');
      setConfirmPassword('');
      Alert.alert('', 'Hasło zostało zmienione.');
    } else {
      setPassword('');
      setConfirmPassword('');
      setLoadingModalError(true);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalVisible(true);
  };
  const handleDeleteUser = async () => {
    setDeleteModalVisible(false);
    setLoadingModalError(false);
    setLoadingModalVisible(true);

    const result = await deleteUser();
    if (result === true) {
      setLoadingModalVisible(false);
      Alert.alert('', 'Użytkownik został usunięty.\nZostniesz wylogowany.', [
        {
          onPress: async () => {
            await AsyncStorage.setItem('token', '');
            navigation.reset({index: 0, routes: [{name: 'Login'}]});
          },
        },
      ]);
    } else setLoadingModalError(false);
  };

  const hanldeCloseLoadingModal = () => {
    setLoadingModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={{...styles.menuButton, marginRight: 10}}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </TouchableOpacity>
        <View
          style={{...styles.menuButton, backgroundColor: 'transparent'}}></View>
      </View>
      <View style={styles.changePasswordContainer}>
        <View style={styles.inputWrapper}>
          <Image
            source={require('./assets/icons/padlock.png')}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="HASŁO"
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
            placeholder="POWTÓRZ HASŁO"
            placeholderTextColor="#B0B0B0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePasswordClick}>
          <Text style={styles.buttonText}>ZMIEŃ HASŁO</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deleteUserContainer}>
        <TouchableOpacity
          style={{...styles.button, backgroundColor: '#EE4E4E'}}
          onPress={handleDeleteClick}>
          <Text style={styles.buttonText}>USUŃ KONTO</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>USUWANIE KONTA</Text>

            <View style={styles.pickerContainer}>
              <Text
                style={{
                  ...styles.modalText,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Czy chcesz usunąć konto?
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleDeleteUser()}>
                <Text style={styles.buttonText}>AKCEPTUJ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Loading*/}
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
    flex: 1,
    backgroundColor: '#F5EDED',
  },
  menuContainer: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 25,
    margin: 15,
  },
  changePasswordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    margin: 20,
  },
  deleteUserContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.9,
    margin: 20,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
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
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'center',
    marginBottom: 20,
  },
  vehicleList: {
    padding: 5,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d2c6c6',
    borderRadius: 20,
    marginBottom: 20,
  },
  vehicleSection: {
    flex: 3,
    backgroundColor: 'transparent',
  },
  vehicleText: {
    flexDirection: 'column',
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'left',
  },
  removeButtonSection: {
    flex: 1,
    padding: 5,
  },
  vehicleLabel: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'left',
  },
  removeIcon: {
    flex: 1,
    backgroundColor: '#EE4E4E',
    borderRadius: 25,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  menuButton: {
    flex: 1,
    backgroundColor: '#938b8b',
    width: width * 0.9,
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F5EDED',
    borderRadius: 5,
    justifyContent: 'center',
    padding: 10,
  },
  modalTitle: {
    color: '#243642',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 0,
    textAlign: 'left',
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
  input: {
    height: 50,
    width: '100%',
    color: '#0f3877',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
  },
  pickerContainer: {
    flexDirection: 'column',
  },
  picker: {
    width: '100%',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    backgroundColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '48%',
    fontFamily: 'RobotoCondensed-Light',
  },
  cancelButton: {
    backgroundColor: '#EE4E4E',
  },
  saveButton: {
    backgroundColor: '#0f3877',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
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
