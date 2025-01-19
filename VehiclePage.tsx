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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {vehicle} from './Interfaces';
import {createVehicle, removeVehicle, getVehicles} from './ApiController';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from './types';

const {width, height} = Dimensions.get('window');

export default function VehiclePage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newRegistrationNumber, setNewRegistrationNumber] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('');

  const fetchVehicles = async () => {
    const vehicles = await getVehicles();
    if (vehicles) {
      setVehicles(vehicles);
    } else {
      Alert.alert(
        'Błąd',
        'Nie udało się pobrać listy pojazdów. Sprawdź połączenie z internetem.',
      );
    }
  };
  useEffect(() => {
    const initializeVehicles = async () => {
      await fetchVehicles();
    };
    initializeVehicles();
  }, []);

  const handleAddVehicle = async () => {
    const isDuplicate = vehicles.some(
      vehicle =>
        vehicle.licensePlate.toUpperCase() ===
        newRegistrationNumber.toUpperCase(),
    );

    if (isDuplicate) {
      Alert.alert(
        'Ups! Coś poszło nie tak',
        'Pojazd o tym numerze rejestracyjnym już istnieje.',
      );
      return;
    }

    if (!newRegistrationNumber || !newVehicleType) {
      Alert.alert('Ups! Coś poszło nie tak', 'Wszystkie pola są wymagane.');
      return;
    }

    const result = await createVehicle(newVehicleType, newRegistrationNumber);
    if (result === true) {
      fetchVehicles();
    }
    setNewRegistrationNumber('');
    setNewVehicleType('');
    setCreateModalVisible(false);
  };

  const handleRemoveVehicle = async (vehicleId: number) => {
    const result = await removeVehicle(vehicleId);
    console.log(result);
    if (result === true) {
      fetchVehicles();
    } else {
      Alert.alert('Ups! Coś poszło nie tak', 'Sprawdź połączenie z internetem');
    }
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
          onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.menuButtonText}>DODAJ POJAZD</Text>
        </Pressable>
      </View>
      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.vehicleList}
      />

      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DODAJ NOWY POJAZD</Text>
            <TextInput
              style={styles.input}
              placeholder="NR REJESTRACYJNY"
              placeholderTextColor="#B0B0B0"
              value={newRegistrationNumber}
              onChangeText={setNewRegistrationNumber}
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newVehicleType}
                onValueChange={itemValue => setNewVehicleType(itemValue)}
                style={styles.picker}>
                <Picker.Item label="WYBIERZ RODZAJ POJAZDU" value="" />
                <Picker.Item label="CIĘŻAROWY" value="CIĘŻAROWY" />
                <Picker.Item label="BUS" value="BUS" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVehicle}>
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
    width: '90%',
    backgroundColor: '#F5EDED',
    borderRadius: 5,
    padding: 20,
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
  input: {
    backgroundColor: '#243642',
    padding: 10,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'column',
  },
  picker: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 30,
    backgroundColor: '#243642',
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
  },
  saveButton: {
    backgroundColor: '#238636',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
  },
});
