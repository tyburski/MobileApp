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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {vehicle} from './Interfaces';
import {createVehicle, getVehicles} from './ApiController';

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
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
  useEffect(() => {
    const loadSelectedVehicle = async () => {
      const storedRegistration = await AsyncStorage.getItem('selectedVehicle');
      if (storedRegistration) {
        setVehicles(prevVehicles =>
          prevVehicles.map(vehicle => ({
            ...vehicle,
            selected: vehicle.registrationNumber === storedRegistration,
          })),
        );
      }
    };

    loadSelectedVehicle();
  }, []);

  const handleAddVehicle = async () => {
    const isDuplicate = vehicles.some(
      vehicle =>
        vehicle.registrationNumber.toLowerCase() ===
        newRegistrationNumber.toLowerCase(),
    );

    if (isDuplicate) {
      Alert.alert('Błąd', 'Pojazd o tym numerze rejestracyjnym już istnieje.');
      return;
    }

    if (!newRegistrationNumber || !newVehicleType) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane.');
      return;
    }

    const newVehicle: vehicle = {
      id: 0,
      registrationNumber: newRegistrationNumber,
      addedDate: new Date().toISOString().split('T')[0],
      vehicleType: newVehicleType,
      selected: false,
    };

    const result = await createVehicle(newVehicle);
    if (result === true) {
      setVehicles([...vehicles, newVehicle]);
    } else {
      Alert.alert('Sprawdź połączenie z internetem');
    }
    setNewRegistrationNumber('');
    setNewVehicleType('');
    setModalVisible(false);
  };

  const handleSelectVehicle = async (vehicleId: number) => {
    const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (selectedVehicle) {
      await AsyncStorage.setItem(
        'selectedVehicle',
        selectedVehicle.registrationNumber,
      );

      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle => ({
          ...vehicle,
          selected: vehicle.id === vehicleId,
        })),
      );
    }
  };

  const handleRemoveVehicle = (vehicleId: number) => {
    const updatedVehicles = vehicles.filter(
      vehicle => vehicle.id !== vehicleId,
    );
    setVehicles(updatedVehicles);

    const removedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (removedVehicle?.selected && updatedVehicles.length > 0) {
      AsyncStorage.setItem(
        'selectedVehicle',
        updatedVehicles[0].registrationNumber,
      );
      updatedVehicles[0].selected = true;
    }
  };

  const renderVehicleItem = ({item}: {item: vehicle}) => (
    <TouchableOpacity
      style={[
        styles.vehicleCard,
        item.selected && styles.selectedVehicleCard, // Dynamicznie dodajemy styl
      ]}
      onPress={() => handleSelectVehicle(item.id)}>
      <TouchableOpacity
        style={styles.removeIcon}
        onPress={() => handleRemoveVehicle(item.id)}>
        <Text style={styles.removeIconText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.vehicleText}>
        <Text style={styles.vehicleLabel}>NR REJESTRACYJNY: </Text>
        {item.registrationNumber}
      </Text>
      <Text style={styles.vehicleText}>
        <Text style={styles.vehicleLabel}>DATA DODANIA: </Text>
        {item.addedDate}
      </Text>
      <Text style={styles.vehicleText}>
        <Text style={styles.vehicleLabel}>RODZAJ POJAZDU: </Text>
        {item.vehicleType}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.vehicleList}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>DODAJ POJAZD</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
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
                <Picker.Item
                  label="CIĄGNIK SIODŁOWY"
                  value="CIĄGNIK SIODŁOWY"
                />
                <Picker.Item
                  label="POJAZD CIĘŻAROWY"
                  value="POJAZD CIĘŻAROWY"
                />
                <Picker.Item label="BUS" value="BUS" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVehicle}>
                <Text style={styles.buttonText}>DODAJ</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0D1117',
    padding: 10,
  },
  vehicleList: {
    paddingBottom: 80,
  },
  vehicleCard: {
    backgroundColor: '#243642',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  selectedVehicleCard: {
    backgroundColor: '#1E88E5',
    borderColor: '#1565C0',
    borderWidth: 1,
  },
  vehicleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
  },
  vehicleLabel: {
    fontFamily: 'RobotoCondensed-Black',
    color: '#FFFFFF',
  },
  removeIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#D32F2F',
    borderRadius: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Black',
  },
  addButton: {
    width: '100%',
    height: 55,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#238636',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#161B22',
    borderColor: '#30363D',
    borderWidth: 1,
    borderRadius: 5,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Black',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#243642',
    borderRadius: 5,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Black',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#243642',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    color: '#FFFFFF',
    fontSize: 20,
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
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
    fontFamily: 'RobotoCondensed-Black',
  },
});
