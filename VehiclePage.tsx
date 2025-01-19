import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {vehicle} from './Interfaces';
import {createVehicle, removeVehicle, getVehicles} from './ApiController';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from './types';

const {width, height} = Dimensions.get('window');

export default function VehiclePage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [vehicles, setVehicles] = useState<vehicle[] | undefined>();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('');
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
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

  const fetchVehicles = async () => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const companies = await getVehicles();
    setLoadingModalVisible(false);
    setVehicles(companies);
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      fetchVehicles();
    }
  }, [isFocused]);

  const handleAddCompany = () => {
    setNewRegistrationNumber('');
    setNewVehicleType('');
    setCreateModalVisible(true);
  };

  const confirmAddVehicle = async () => {
    if (!newRegistrationNumber || !newVehicleType) {
      Alert.alert('', 'Wszystkie pola są wymagane.');
      return;
    }
    setCreateModalVisible(false);
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const result = await createVehicle(newVehicleType, newRegistrationNumber);
    if (result === true) {
      fetchVehicles();
    } else setLoadingModalError(true);
  };

  const handleRemoveVehicle = async (companyId: number) => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const result = await removeVehicle(companyId);
    if (result === true) {
      fetchVehicles();
    } else setLoadingModalError(false);
  };

  const hanldeCloseLoadingModal = () => {
    setLoadingModalVisible(false);
  };

  const renderVehicleItem = ({item}: {item: vehicle}) => (
    <View style={[styles.vehicleCard]}>
      <View style={styles.vehicleSection}>
        <Text style={styles.vehicleText}>
          <Text style={styles.vehicleLabel}>NR REJ.: </Text>
          {item.licensePlate}
        </Text>
        <Text style={styles.vehicleText}>
          <Text style={styles.vehicleLabel}>RODZAJ: </Text>
          {item.type}
        </Text>
      </View>
      <View style={styles.removeButtonSection}>
        <Pressable
          style={styles.removeIcon}
          onPress={() => handleRemoveVehicle(item.id)}>
          <Text style={styles.removeIconText}>USUŃ</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Pressable
          style={{...styles.menuButton, marginRight: 10}}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </Pressable>
        <Pressable
          style={{...styles.menuButton, backgroundColor: '#0f3877'}}
          onPress={() => handleAddCompany()}>
          <Text style={styles.menuButtonText}>DODAJ POJAZD</Text>
        </Pressable>
      </View>
      {vehicles !== undefined && (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.vehicleList}
        />
      )}
      {vehicles === undefined && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Wygląda na to, że nic tu nie ma!
          </Text>
          <Text style={styles.emptyListText}>
            Kliknij przycisk na górze, aby dodać pojazd.
          </Text>
        </View>
      )}

      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DODAJ NOWY POJAZD</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="NR REJESTRACYJNY"
                  placeholderTextColor="#B0B0B0"
                  value={newRegistrationNumber}
                  onChangeText={setNewRegistrationNumber}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Picker
                  selectedValue={newVehicleType}
                  onValueChange={itemValue => setNewVehicleType(itemValue)}
                  style={styles.picker}>
                  <Picker.Item label="WYBIERZ RODZAJ POJAZDU" value="" />
                  <Picker.Item label="CIĘŻAROWY" value="CIĘŻAROWY" />
                  <Picker.Item label="BUS" value="BUS" />
                </Picker>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={confirmAddVehicle}>
                <Text style={styles.buttonText}>DODAJ</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </Pressable>
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
    padding: 5,
  },
  menuContainer: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 10,
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
