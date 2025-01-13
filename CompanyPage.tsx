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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {company} from './Interfaces';
import {createCompany, removeCompany, getCompanies} from './ApiController';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from './types';

export default function CompanyPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [companies, setCompanies] = useState<company[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');

  const fetchCompanies = async () => {
    const companies = await getCompanies();
    if (companies) {
      setCompanies(companies);
    } else {
      Alert.alert(
        'UPS! Coś poszło nie tak',
        'Nie udało się pobrać listy firm. Sprawdź połączenie z internetem.',
      );
    }
  };
  useEffect(() => {
    const initializeCompanies = async () => {
      await fetchCompanies();
    };
    initializeCompanies();
  }, []);

  const handleAddCompany = async () => {
    const isDuplicate = companies.some(
      company => company.name.toUpperCase() === newCompanyName.toUpperCase(),
    );

    if (isDuplicate) {
      Alert.alert('Ups! Coś poszło nie tak', 'Taka firma już istnieje.');
      return;
    }

    if (!newCompanyName || !newCompanyEmail) {
      Alert.alert('Ups! Coś poszło nie tak', 'Wszystkie pola są wymagane.');
      return;
    }

    const newCompany: company = {
      id: 0,
      name: newCompanyName,
      email: newCompanyEmail,
    };

    const result = await createCompany(newCompany);
    if (result === true) {
      fetchCompanies();
    } else {
      Alert.alert('Ups! Coś poszło nie tak', 'Sprawdź połączenie z internetem');
    }
    setNewCompanyName('');
    setNewCompanyEmail('');
    setCreateModalVisible(false);
  };

  const handleRemoveCompany = async (companyId: number) => {
    const result = await removeCompany(companyId);
    console.log(result);
    if (result === true) {
      fetchCompanies();
    } else {
      Alert.alert('Ups! Coś poszło nie tak', 'Sprawdź połączenie z internetem');
    }
  };

  const renderVehicleItem = ({item}: {item: company}) => (
    <View style={[styles.vehicleCard]}>
      <View style={styles.vehicleSection}>
        <Text style={styles.vehicleText}>
          <Text style={styles.vehicleLabel}>NAZWA: </Text>
          {item.name}
        </Text>
        <Text style={styles.vehicleText}>
          <Text style={styles.vehicleLabel}>E-MAIL: </Text>
          {item.email}
        </Text>
      </View>
      <View style={styles.removeButtonSection}>
        <Pressable
          style={styles.removeIcon}
          onPress={() => handleRemoveCompany(item.id)}>
          <Text style={styles.removeIconText}>USUŃ</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </Pressable>
        <Pressable
          style={styles.menuButton}
          onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.menuButtonText}>DODAJ</Text>
          <Text style={styles.menuButtonText}>FIRMĘ</Text>
        </Pressable>
      </View>
      <FlatList
        data={companies}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.vehicleList}
      />

      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DODAJ NOWĄ FIRMĘ</Text>
            <TextInput
              style={styles.input}
              placeholder="NAZWA"
              placeholderTextColor="#B0B0B0"
              value={newCompanyName}
              onChangeText={setNewCompanyName}
            />
            <View style={styles.pickerContainer}>
              <TextInput
                style={styles.input}
                placeholder="EMAIL"
                placeholderTextColor="#B0B0B0"
                value={newCompanyEmail}
                onChangeText={setNewCompanyEmail}
              />
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCompany}>
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
    height: '10%',
    width: '40%',
    backgroundColor: '#F5EDED',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vehicleList: {
    padding: 5,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#243642',
    borderRadius: 5,
    marginBottom: 15,
  },
  vehicleSection: {
    flex: 5,
    padding: 10,
    flexDirection: 'column',
    backgroundColor: '#243642',
    borderRadius: 5,
    width: '100%',
  },
  removeButtonSection: {
    flex: 1,
    padding: 10,
  },
  vehicleText: {
    flexDirection: 'column',
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'left',
  },
  vehicleLabel: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Bold',
    textAlign: 'left',
  },
  removeIcon: {
    flex: 1,
    backgroundColor: '#D32F2F',
    borderRadius: 5,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  menuButton: {
    flex: 1,
    height: '100%',
    backgroundColor: '#243642',
    borderWidth: 0,
    borderRadius: 5,
    borderColor: '#6482AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
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
