import {
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  TextInput,
  Modal,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useState} from 'react';
import {useEffect} from 'react';
import Geofencing from '@rn-bridge/react-native-geofencing';
import {getNeighbors} from './borders';
import Sound from 'react-native-sound';
import * as apiController from './ApiController.tsx';
import {
  route,
  routeEvent,
  vehicle,
  company,
  dropModel,
  borderModel,
  pickupModel,
  refuelModel,
  startModel,
  finishModel,
} from './Interfaces.tsx';
import {Currency} from './Dispatcher.tsx';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';
import Moment from 'moment';

const {width, height} = Dimensions.get('window');

export default function Main() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [route, setRoute] = useState<route | undefined>();
  const [routeEvents, setRouteEvents] = useState<routeEvent[]>([]);
  const [borders, setBorders] = useState<string[] | undefined>([]);
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [companies, setCompanies] = useState<company[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<vehicle | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<company | undefined>();
  //Modale
  const [isStartModalVisible, setStartModalVisible] = useState(false);
  const [isRefuelModalVisible, setRefuelModalVisible] = useState(false);
  const [isFinishModalVisible, setFinishModalVisible] = useState(false);
  const [isPickupModalVisible, setPickupModalVisible] = useState(false);
  const [isBorderModalVisible, setBorderModalVisible] = useState(false);
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isLoadingModalError, setLoadingModalError] = useState(true);

  //tankowanie
  const [refuelCount, setRefuelCount] = useState('');
  const [refuelTotal, setRefuelTotal] = useState('');
  const [refuelCurrency, setRefuelCurrency] = useState('');
  const [refuelType, setRefuelType] = useState('');

  //załadunek
  const [pickupCount, setPickupCount] = useState('');
  const [pickupWeight, setPickupWeight] = useState('');
  const [pickupComment, setPickupComment] = useState('');

  const [buttonState, setButtonState] = useState({
    text: 'START',
    color: '#243642',
  });

  const playSound = () => {
    Sound.setCategory('Playback');
    var sound = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      sound.play();
    });
    sound.release();
  };

  //animacje

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

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setLoadingModalError(false);
      setLoadingModalVisible(true);
      getRoute();
    }
  }, [isFocused]);

  //pobieranie danych
  const getvehicles = async () => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const response = await apiController.getVehicles();
    if (response !== undefined) {
      setVehicles(response);
      setLoadingModalVisible(false);
      return true;
    } else {
      setLoadingModalError(true);
      return false;
    }
  };
  const getcompanies = async () => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const response = await apiController.getCompanies();
    if (response !== undefined) {
      setCompanies(response);
      setLoadingModalVisible(false);
      return true;
    } else {
      setLoadingModalError(true);
      return false;
    }
  };
  const getRoute = async () => {
    const route = await apiController.getRoute();
    if (route !== undefined) {
      setRoute(route);
      setRouteEvents(route.routeEvents.reverse());
      setLoadingModalVisible(false);
    } else if (route === undefined) {
      setLoadingModalVisible(false);
      setRoute(undefined);
    }
  };
  const getBorders = (input: string) => {
    const res = getNeighbors(input);
    setBorders(res);
  };

  //przyciski
  const startRouteClick = async () => {
    if (selectedCompany === undefined || selectedVehicle === undefined) {
      Alert.alert('', 'Wszystkie pola są wymagane.');
      return;
    }
    setStartModalVisible(false);
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const position = await Geofencing.getCurrentLocation();
    const start: startModel = {
      vehicleId: selectedVehicle?.id,
      companyId: selectedCompany?.id,
      latitude: position.latitude,
      longitude: position.longitude,
      country: position.isoCountryCode,
    };
    const result = await apiController.newRoute(start);
    if (result === true) {
      setLoadingModalVisible(false);
      playSound();
      getRoute();
    } else setLoadingModalError(true);
  };

  const finishRoute = async () => {
    setFinishModalVisible(false);
    if (route !== undefined) {
      setLoadingModalError(false);
      setLoadingModalVisible(true);
      const position = await Geofencing.getCurrentLocation();
      const finish: finishModel = {
        routeId: route.id,
        latitude: position.latitude,
        longitude: position.longitude,
        country: position.isoCountryCode,
      };
      const response = await apiController.finishRoute(finish);

      if (response === true) {
        playSound();
        getRoute();
      } else setLoadingModalError(true);
    }
  };
  const handleStartClick = async () => {
    const v = await getvehicles();
    const c = await getcompanies();
    console.log(vehicles.length);
    console.log(companies.length);
    if (v === true && c === true) {
      setStartModalVisible(true);
    } else Alert.alert('', 'Najpierw utwórz firmę i pojazd');
  };
  const handleFinishClick = async () => {
    setFinishModalVisible(true);
  };

  const handleRefuelClick = () => {
    setRefuelModalVisible(true);
  };
  const confirmRefuelClick = async () => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setRefuelModalVisible(false);
      setLoadingModalError(false);
      setLoadingModalVisible(true);

      const refuel: refuelModel = {
        latitude: position.latitude,
        longitude: position.longitude,
        routeId: route.id,
        refuelCount: parseInt(refuelCount),
        refuelTotal: parseInt(refuelTotal),
        refuelCurrency: refuelCurrency,
        refuelType: refuelType,
      };
      const res1 = await apiController.newRefuel(refuel);

      if (res1 === true) {
        playSound();
        setLoadingModalVisible(false);
        getRoute();
      } else setLoadingModalError(true);
    }
  };
  const handlePickupClick = () => {
    setPickupModalVisible(true);
  };
  const confirmPickupClick = async () => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setPickupModalVisible(false);
      setLoadingModalError(false);
      setLoadingModalVisible(true);

      const pickup: pickupModel = {
        latitude: position.latitude,
        longitude: position.longitude,
        routeId: route.id,
        pickupCount: parseInt(pickupCount),
        pickupWeight: parseInt(pickupWeight),
        pickupComment: pickupComment,
      };
      const res1 = await apiController.newPickup(pickup);

      if (res1 === true) {
        playSound();
        setLoadingModalVisible(false);
        getRoute();
      } else setLoadingModalError(true);
    }
  };
  const handleDropClick = async (event: routeEvent) => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const position = await Geofencing.getCurrentLocation();
    const drop: dropModel = {
      eventId: event.id,
      dropLatitude: position.latitude,
      dropLongitude: position.longitude,
    };
    const result = await apiController.drop(drop);
    if (result === true) {
      setLoadingModalVisible(false);
      getRoute();
    } else setLoadingModalError(true);
  };
  const handleBorderClick = () => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    if (route !== undefined) {
      getBorders(route.currentCountry);
      setLoadingModalVisible(false);
      setBorderModalVisible(true);
    } else setLoadingModalError(true);
  };
  const confirmBorderClick = async (input: string) => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setBorders([]);
      setBorderModalVisible(false);
      setLoadingModalError(false);
      setLoadingModalVisible(true);

      const border: borderModel = {
        latitude: position.latitude,
        longitude: position.longitude,
        routeId: route.id,
        borderFrom: route.currentCountry,
        borderTo: input,
      };
      const response = await apiController.newBorder(border);

      if (response === true) {
        playSound();
        setLoadingModalVisible(false);
        getRoute();
      } else setLoadingModalError(true);
    }
  };

  //lista zdarzeń
  const renderRouteEventItem = ({item}: {item: routeEvent}) => (
    <View style={[styles.eventCard]}>
      <View style={styles.eventSection}>
        {item.eventName === 'start' && (
          <View>
            <Text
              style={{
                ...styles.eventText,
                fontFamily: 'RobotoCondensed-Regular',
              }}>
              ROZPOCZĘCIE TRASY
            </Text>
            <Text style={styles.eventText}>
              {Moment(item.date).format('DD.MM.YYYY hh:mm')}
            </Text>
          </View>
        )}
        {item.eventName === 'border' && (
          <View>
            <Text
              style={{
                ...styles.eventText,
                fontFamily: 'RobotoCondensed-Regular',
              }}>
              GRANICA {item.borderFrom}/{item.borderTo}
            </Text>
            <Text style={styles.eventText}>
              {Moment(item.date).format('DD.MM.YYYY hh:mm')}
            </Text>
          </View>
        )}
        {item.eventName === 'refuel' && (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={styles.eventCol1}>
              <Text
                style={{
                  ...styles.eventText,
                  fontFamily: 'RobotoCondensed-Regular',
                }}>
                TANKOWANIE
              </Text>
              <Text style={styles.eventText}>
                {Moment(item.date).format('DD.MM.YYYY hh:mm')}
              </Text>
            </View>
            <View style={styles.eventCol2}>
              <Text style={{...styles.eventText, textAlign: 'right'}}>
                {item.refuelTotal} {Currency(item.refuelCurrency)}
              </Text>
              <Text style={{...styles.eventText, textAlign: 'right'}}>
                {item.refuelType}
              </Text>
            </View>
          </View>
        )}
        {item.eventName === 'pickup' && (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={styles.eventCol1}>
              <Text
                style={{
                  ...styles.eventText,
                  fontFamily: 'RobotoCondensed-Regular',
                }}>
                ZAŁADUNEK
              </Text>
              <Text style={styles.eventText}>
                {Moment(item.date).format('DD.MM.YYYY hh:mm')}
              </Text>
              {item.dropDate === null && (
                <Pressable
                  style={styles.dropButton}
                  onPress={() => handleDropClick(item)}>
                  <Text style={styles.dropButtonText}>ROZŁADUNEK</Text>
                </Pressable>
              )}
              {item.dropDate !== null && (
                <View style={styles.eventCol1}>
                  <Text
                    style={{
                      ...styles.eventText,
                      fontFamily: 'RobotoCondensed-Regular',
                      marginTop: 10,
                    }}>
                    ROZŁADUNEK
                  </Text>
                  <Text style={styles.eventText}>
                    {Moment(item.date).format('DD.MM.YYYY hh:mm')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.eventCol2}>
              <Text style={{...styles.eventText, textAlign: 'right'}}>
                {item.pickupCount}
              </Text>
              <Text style={{...styles.eventText, textAlign: 'right'}}>
                {item.pickupWeight} KG
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  //lista granic
  const renderBorderEventItem = ({item}: {item: string}) => (
    <View style={[styles.borderCard]}>
      <View style={styles.borderSection}>
        <Pressable
          style={styles.borderButton}
          onPress={() => confirmBorderClick(item)}>
          <Text style={styles.borderButtonText}>{item}</Text>
        </Pressable>
      </View>
    </View>
  );

  const hanldeCloseLoadingModal = () => {
    setLoadingModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{...styles.button, marginRight: 10}}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </TouchableOpacity>
        {route !== undefined && (
          <TouchableOpacity
            style={{
              ...styles.button,
              backgroundColor: '#EE4E4E',
              marginBottom: 20,
            }}
            onPress={() => handleFinishClick()}>
            <Text style={styles.menuButtonText}>ZAKOŃCZ TRASĘ</Text>
          </TouchableOpacity>
        )}
        {route === undefined && (
          <TouchableOpacity
            style={{
              ...styles.button,
              backgroundColor: '#0f3877',
              marginBottom: 20,
            }}
            onPress={() => handleStartClick()}>
            <Text style={styles.menuButtonText}>ROZPOCZNIJ TRASĘ</Text>
          </TouchableOpacity>
        )}
      </View>

      {route !== undefined && (
        <View style={styles.listContainer}>
          <FlatList
            data={routeEvents}
            renderItem={renderRouteEventItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.eventsList}
          />
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={{...styles.actionButton, marginRight: 20}}
              onPress={() => handlePickupClick()}>
              <Image
                source={require('./assets/icons/forklift.png')}
                style={styles.eventIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{...styles.actionButton, marginRight: 20}}
              onPress={() => handleRefuelClick()}>
              <Image
                source={require('./assets/icons/refuel.png')}
                style={styles.eventIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleBorderClick()}>
              <Image
                source={require('./assets/icons/border.png')}
                style={styles.eventIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {route === undefined && (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Wygląda na to, że nic tu nie ma!
          </Text>
          <Text style={styles.emptyListText}>
            Kliknij przycisk na górze, aby rozpocząć.
          </Text>
        </View>
      )}

      {/* Modal startowania trasy */}
      <Modal
        visible={isStartModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setStartModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NOWA TRASA</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.inputWrapper}>
                <Picker
                  style={styles.picker}
                  selectedValue={selectedVehicle}
                  onValueChange={itemValue => setSelectedVehicle(itemValue)}>
                  <Picker.Item label="WYBIERZ POJAZD" value="" />
                  {vehicles.map(vehicle => (
                    <Picker.Item
                      key={vehicle.licensePlate}
                      label={vehicle.licensePlate}
                      value={vehicle}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.inputWrapper}>
                <Picker
                  style={styles.picker}
                  selectedValue={selectedCompany}
                  onValueChange={itemValue => setSelectedCompany(itemValue)}>
                  <Picker.Item label="WYBIERZ FIRMĘ" value="" />
                  {companies.map(company => (
                    <Picker.Item
                      key={company.name}
                      label={company.name}
                      value={company}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => startRouteClick()}>
                <Text style={styles.buttonText}>ZACZYNAMY</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setStartModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal tankowania*/}
      <Modal
        visible={isRefuelModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setRefuelModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>TANKOWANIE</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ILOŚĆ"
                  keyboardType="numeric"
                  placeholderTextColor="#B0B0B0"
                  value={refuelCount}
                  onChangeText={setRefuelCount}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="WARTOŚĆ"
                  keyboardType="numeric"
                  placeholderTextColor="#B0B0B0"
                  value={refuelTotal}
                  onChangeText={setRefuelTotal}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Picker
                  style={styles.picker}
                  selectedValue={refuelCurrency}
                  onValueChange={setRefuelCurrency}>
                  <Picker.Item label="WALUTA" value="" />
                  <Picker.Item label="ZŁ" value="PLN" />
                  <Picker.Item label="€" value="EURO" />
                  <Picker.Item label="Kč" value="KORONY_CZESKIE" />
                </Picker>
              </View>
              <View style={styles.inputWrapper}>
                <Picker
                  style={styles.picker}
                  selectedValue={refuelType}
                  onValueChange={setRefuelType}>
                  <Picker.Item label="RODZAJ" value="" />
                  <Picker.Item label="ON" value="ON" />
                  <Picker.Item label="ADBLUE" value="ADBLUE" />
                </Picker>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => confirmRefuelClick()}>
                <Text style={styles.buttonText}>AKCEPTUJ</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRefuelModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal Załadunku*/}
      <Modal
        visible={isPickupModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setPickupModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ZAŁADUNEK</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ILOŚĆ"
                  keyboardType="numeric"
                  placeholderTextColor="#B0B0B0"
                  value={pickupCount}
                  onChangeText={setPickupCount}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="WAGA[KG]"
                  keyboardType="numeric"
                  placeholderTextColor="#B0B0B0"
                  value={pickupWeight}
                  onChangeText={setPickupWeight}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={{
                    ...styles.input,
                    height: 120,
                    textAlignVertical: 'top',
                  }}
                  editable
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                  placeholder="Tutaj możesz dodać komentarz"
                  keyboardType="default"
                  placeholderTextColor="#B0B0B0"
                  value={pickupComment}
                  onChangeText={setPickupComment}
                />
              </View>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => confirmPickupClick()}>
                <Text style={styles.buttonText}>AKCEPTUJ</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPickupModalVisible(false)}>
                <Text style={styles.buttonText}>ANULUJ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal Granicy*/}
      <Modal
        visible={isBorderModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setBorderModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>GRANICA</Text>
            <Pressable
              style={[styles.borderCancelButton]}
              onPress={() => setBorderModalVisible(false)}>
              <Text style={styles.buttonText}>X</Text>
            </Pressable>
            <FlatList
              data={borders}
              renderItem={renderBorderEventItem}
              keyExtractor={item => item}
              contentContainerStyle={styles.bordersList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal finish*/}
      <Modal
        visible={isFinishModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setFinishModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>KONIEC TRASY</Text>

            <View style={styles.pickerContainer}>
              <Text
                style={{
                  ...styles.modalText,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Czy chcesz zakończyć trasę?
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => finishRoute()}>
                <Text style={styles.buttonText}>AKCEPTUJ</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setFinishModalVisible(false)}>
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
    flexDirection: 'column',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#938b8b',
    width: width * 0.9,
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
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
  actionsContainer: {
    height: 80,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0f3877',
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsList: {
    backgroundColor: 'transparent',
    marginHorizontal: 0,
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

  menuContainer: {
    height: '10%',
    backgroundColor: '#F5EDED',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 5,
  },
  routeContainer: {
    height: '90%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    height: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Bold',
  },
  backButton: {
    flex: 1,
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#243642',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 30,
    marginBottom: 10,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  modalText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    marginBottom: 0,
    textAlign: 'left',
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
  modalErrorText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    marginBottom: 30,
    textAlign: 'center',
  },
  modalErrorButton: {
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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

  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 10,
  },
  eventSection: {
    padding: 15,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d2c6c6',
    borderRadius: 20,
    width: '100%',
  },
  eventText: {
    flexDirection: 'column',
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'left',
  },
  eventIcon: {
    height: '50%',
    width: '50%',
  },
  eventCol1: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  eventCol2: {
    flex: 1,
  },
  bordersList: {
    margin: 10,
  },
  borderCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  borderSection: {
    flexDirection: 'column',
    borderColor: '#0f3877',
    width: '100%',
    zIndex: 0,
  },
  borderButton: {
    flex: 1,
    backgroundColor: '#938b8b',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    padding: 20,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  borderCancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 40,
    width: 40,
    zIndex: 1,
    backgroundColor: '#EE4E4E',
    borderWidth: 0,
    borderRadius: 15,
    borderColor: '#6482AD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropButton: {
    flex: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: '#938b8b',
    width: '50%',
    height: 30,
    marginTop: 10,
  },
  dropButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'RobotoCondensed-Light',
    textAlignVertical: 'center',
  },
});
