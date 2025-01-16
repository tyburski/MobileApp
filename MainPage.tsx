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
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useState, useRef} from 'react';
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
} from './Interfaces.tsx';
import {Currency} from './Dispatcher.tsx';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';
import Moment from 'moment';

export default function Main() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [route, setRoute] = useState<route>();
  const [routeEvents, setRouteEvents] = useState<routeEvent[]>([]);
  const [borders, setBorders] = useState<string[] | undefined>([]);
  const [vehicles, setVehicles] = useState<vehicle[]>([]);
  const [companies, setCompanies] = useState<company[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<vehicle | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<company | undefined>();
  //Modale
  const [isStartModalVisible, setStartModalVisible] = useState(false);
  const [isRefuelModalVisible, setRefuelModalVisible] = useState(false);
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [isPickupModalVisible, setPickupModalVisible] = useState(false);
  const [isBorderModalVisible, setBorderModalVisible] = useState(false);
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);

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
  const [progress, setProgress] = useState(new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | number>(0);

  const handleStartPress = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      handleStartStopClick();
      handleEndPress();
    }, 2000);
  };
  const handleEndPress = () => {
    clearTimeout(timerRef.current);

    setProgress(new Animated.Value(0));
    Animated.timing(progress, {
      toValue: 0,
      duration: 0,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  const progressInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
      setLoadingModalVisible(true);
      getRoute();
    }
  }, [isFocused]);

  //pobieranie danych
  const getvehicles = async () => {
    setVehicles(await apiController.getVehicles());
  };
  const getcompanies = async () => {
    setCompanies(await apiController.getCompanies());
  };
  const getRoute = async () => {
    const route = await apiController.getRoute();
    if (route !== false) {
      setButtonState({text: 'STOP', color: '#D32F2F'});
      setRoute(route);
      setRouteEvents(route.routeEvents.reverse());
    }
    setLoadingModalVisible(false);
  };
  const getBorders = (input: string) => {
    const res = getNeighbors(input);
    setBorders(res);
  };

  //przyciski
  const startRoute = async () => {
    setStartModalVisible(false);
    setLoadingModalVisible(true);
    const position = await Geofencing.getCurrentLocation();
    if (selectedVehicle !== undefined || selectedCompany !== undefined) {
      const start: startModel = {
        vehicleId: selectedVehicle?.id,
        companyId: selectedCompany?.id,
        latitude: position.latitude,
        longitude: position.longitude,
        country: position.isoCountryCode,
      };
      const result = await apiController.newRoute(start);
      if (result === true) {
        getRoute();
      } else setLoadingModalVisible(false);
    }
  };
  const finishRoute = async () => {
    if (route !== undefined) {
      setLoadingModalVisible(true);
      const id = route.id;
      const response = await apiController.finishRoute(id);

      if (response === true) {
        setButtonState({text: 'START', color: '#243642'});
        setRouteEvents([]);
      }
      setLoadingModalVisible(false);
    }
  };
  const handleStartStopClick = async () => {
    if (buttonState.text === 'START') {
      playSound();
      getvehicles();
      getcompanies();
      setStartModalVisible(true);
    } else if (buttonState.text === 'STOP') {
      await finishRoute();
      playSound();
    }
  };
  const startRouteClick = () => {
    startRoute();
  };
  const handleRefuelClick = () => {
    if (buttonState.text === 'START') {
      setErrorModalVisible(true);
    } else if (buttonState.text === 'STOP') {
      setRefuelModalVisible(true);
    }
  };
  const confirmRefuelClick = async () => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setRefuelModalVisible(false);
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
        getRoute();
      } else setLoadingModalVisible(false);
    }
  };
  const handlePickupClick = () => {
    if (buttonState.text === 'START') {
      setErrorModalVisible(true);
    } else if (buttonState.text === 'STOP') {
      setPickupModalVisible(true);
    }
  };
  const confirmPickupClick = async () => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setPickupModalVisible(false);
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
        getRoute();
      } else setLoadingModalVisible(false);
    }
  };
  const handleDropClick = async (event: routeEvent) => {
    setLoadingModalVisible(true);
    const position = await Geofencing.getCurrentLocation();
    const drop: dropModel = {
      eventId: event.id,
      dropLatitude: position.latitude,
      dropLongitude: position.longitude,
    };
    const result = await apiController.drop(drop);
    if (result === true) {
      getRoute();
    } else setLoadingModalVisible(false);
  };
  const handleBorderClick = () => {
    if (buttonState.text === 'START') {
      setErrorModalVisible(true);
    } else if (buttonState.text === 'STOP') {
      if (route !== undefined) {
        getBorders(route.currentCountry);
        setBorderModalVisible(true);
      }
    }
  };
  const confirmBorderClick = async (input: string) => {
    const position = await Geofencing.getCurrentLocation();

    if (route !== undefined) {
      setBorders([]);
      setBorderModalVisible(false);
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
        getRoute();
      } else setLoadingModalVisible(false);
    }
  };

  //lista zdarzeń
  const renderRouteEventItem = ({item}: {item: routeEvent}) => (
    <View style={[styles.eventCard]}>
      <View style={styles.eventIconSection}>
        {item.eventName === 'start' && (
          <Image
            source={require('./assets/icons/start.png')}
            style={styles.eventIcon}
            resizeMode="contain"
          />
        )}
        {item.eventName === 'border' && (
          <Image
            source={require('./assets/icons/border.png')}
            style={{...styles.eventIcon, width: '75%', height: '75%'}}
            resizeMode="contain"
          />
        )}
        {item.eventName === 'refuel' && (
          <Image
            source={require('./assets/icons/refuel.png')}
            style={{...styles.eventIcon, width: '70%', height: '70%'}}
            resizeMode="contain"
          />
        )}
        {item.eventName === 'pickup' && (
          <Image
            source={require('./assets/icons/forklift.png')}
            style={{...styles.eventIcon, width: '70%', height: '70%'}}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.eventSection}>
        {item.eventName === 'start' && (
          <View>
            <Text
              style={{
                ...styles.eventText,
                fontFamily: 'RobotoCondensed-Bold',
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
                fontFamily: 'RobotoCondensed-Bold',
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
                  fontFamily: 'RobotoCondensed-Bold',
                }}>
                TANKOWANIE
              </Text>
              <Text style={styles.eventText}>
                {Moment(item.date).format('DD.MM.YYYY hh:mm')}
              </Text>
            </View>
            <View style={styles.eventCol2}>
              <Text style={styles.eventText}>
                {item.refuelTotal} {Currency(item.refuelCurrency)}
              </Text>
              <Text style={styles.eventText}>{item.refuelType}</Text>
            </View>
            <View style={styles.eventCol3}></View>
          </View>
        )}
        {item.eventName === 'pickup' && (
          <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={styles.eventCol1}>
              <Text
                style={{
                  ...styles.eventText,
                  fontFamily: 'RobotoCondensed-Bold',
                }}>
                ZAŁADUNEK
              </Text>
              <Text style={styles.eventText}>
                {Moment(item.date).format('DD.MM.YYYY hh:mm')}
              </Text>
            </View>
            <View style={styles.eventCol2}>
              <Text style={styles.eventText}>{item.pickupCount}</Text>
              <Text style={styles.eventText}>{item.pickupWeight} KG</Text>
            </View>
            <View style={styles.eventCol3}>
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
                      fontFamily: 'RobotoCondensed-Bold',
                    }}>
                    ROZŁADUNEK
                  </Text>
                  <Text style={styles.eventText}>
                    {Moment(item.date).format('DD.MM.YYYY hh:mm')}
                  </Text>
                </View>
              )}
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

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </Pressable>
        <Pressable
          style={styles.menuButton}
          onPress={() => handlePickupClick()}>
          <Text style={styles.menuButtonText}>ZAŁADUNEK</Text>
        </Pressable>
        <Pressable
          style={styles.menuButton}
          onPress={() => handleRefuelClick()}>
          <Text style={styles.menuButtonText}>TANKOWANIE</Text>
        </Pressable>

        <Pressable
          style={styles.menuButton}
          onPress={() => handleBorderClick()}>
          <Text style={styles.menuButtonText}>GRANICA</Text>
        </Pressable>
        <Pressable
          style={{...styles.startButton, backgroundColor: buttonState.color}}
          onPressIn={handleStartPress}
          onPressOut={handleEndPress}>
          <Animated.View
            style={{
              position: 'absolute',
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              borderRadius: 0,
              borderWidth: 0,
              opacity: 0.5,
              borderColor: 'white',
              transform: [{scaleY: progressInterpolation}],
            }}
          />
          <Text style={styles.startButtonText}>{buttonState.text}</Text>
        </Pressable>
      </View>
      <FlatList
        data={routeEvents}
        renderItem={renderRouteEventItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.eventsList}
      />
      {/* Modal startowania trasy */}
      <Modal
        visible={isStartModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStartModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>NOWA TRASA</Text>

            <View style={styles.pickerContainer}>
              <Text style={styles.modalText}>POJAZD: </Text>
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
              <Text style={styles.modalText}>FIRMA: </Text>
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
        animationType="slide"
        onRequestClose={() => setRefuelModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>TANKOWANIE</Text>

            <View style={styles.pickerContainer}>
              <Text style={styles.modalText}>ILOŚĆ: </Text>
              <TextInput
                style={styles.input}
                placeholder="ILOŚĆ"
                keyboardType="numeric"
                placeholderTextColor="#B0B0B0"
                value={refuelCount}
                onChangeText={setRefuelCount}
              />
              <Text style={styles.modalText}>TOTAL: </Text>
              <TextInput
                style={styles.input}
                placeholder="TOTAL"
                keyboardType="numeric"
                placeholderTextColor="#B0B0B0"
                value={refuelTotal}
                onChangeText={setRefuelTotal}
              />
              <Text style={styles.modalText}>WALUTA: </Text>
              <Picker
                style={styles.picker}
                selectedValue={refuelCurrency}
                onValueChange={setRefuelCurrency}>
                <Picker.Item label="WALUTA" value="" />
                <Picker.Item label="ZŁ" value="PLN" />
                <Picker.Item label="€" value="EURO" />
                <Picker.Item label="Kč" value="KORONY_CZESKIE" />
              </Picker>
              <Text style={styles.modalText}>RODZAJ: </Text>
              <Picker
                style={styles.picker}
                selectedValue={refuelType}
                onValueChange={setRefuelType}>
                <Picker.Item label="RODZAJ" value="" />
                <Picker.Item label="ON" value="ON" />
                <Picker.Item label="ADBLUE" value="ADBLUE" />
              </Picker>
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
        animationType="slide"
        onRequestClose={() => setPickupModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ZAŁADUNEK</Text>

            <View style={styles.pickerContainer}>
              <Text style={styles.modalText}>ILOŚĆ: </Text>
              <TextInput
                style={styles.input}
                placeholder="ILOŚĆ"
                keyboardType="numeric"
                placeholderTextColor="#B0B0B0"
                value={pickupCount}
                onChangeText={setPickupCount}
              />
              <Text style={styles.modalText}>WAGA[KG]: </Text>
              <TextInput
                style={styles.input}
                placeholder="WAGA[KG]"
                keyboardType="numeric"
                placeholderTextColor="#B0B0B0"
                value={pickupWeight}
                onChangeText={setPickupWeight}
              />
              <Text style={styles.modalText}>KOMENTARZ: </Text>
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
        animationType="slide"
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
      {/* Modal Error*/}
      <Modal
        visible={isErrorModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setErrorModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>UPS! COŚ JEST NIE TAK</Text>

            <View style={styles.pickerContainer}>
              <Text style={styles.modalErrorText}>
                NAJPIERW MUSISZ ROZPOCZĄĆ TRASĘ!
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalErrorButton, styles.saveButton]}
                onPress={() => setErrorModalVisible(false)}>
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal Loading*/}
      <Modal
        visible={isLoadingModalVisible}
        transparent={true}
        animationType="slide">
        <View style={styles.modalContainer}>
          <View
            style={{
              ...styles.modalContent,
              backgroundColor: 'white',
              width: '25%',
              height: '25%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Animated.Image
              source={require('./assets/icons/loading.png')}
              style={{
                backgroundColor: 'transparent',

                resizeMode: 'contain',
                height: '80%',
                width: '80%',
                transform: [{rotate: spin}],
              }}
              resizeMode="contain"></Animated.Image>
            <Text
              style={{
                ...styles.modalText,
                color: 'black',
                textAlign: 'center',
              }}>
              Ładowanie...
            </Text>
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
  modalErrorText: {
    color: '#243642',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
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
  input: {
    backgroundColor: '#243642',
    padding: 10,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    marginBottom: 15,
  },
  eventsList: {
    padding: 0,
  },

  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  eventIconSection: {
    flex: 1,
    padding: 0,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 3,
    borderColor: '#243642',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'auto',
    width: 'auto',
  },
  eventSection: {
    flex: 10,
    padding: 5,
    flexDirection: 'row',
    backgroundColor: '#26577C',
    borderWidth: 3,
    borderLeftWidth: 0,
    borderColor: '#243642',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    width: '100%',
  },
  eventText: {
    flexDirection: 'column',
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'left',
  },
  eventIcon: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  eventCol1: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  eventCol2: {
    flex: 1,
  },
  eventCol3: {
    flex: 2,
    alignItems: 'flex-end',
  },
  bordersList: {
    padding: 0,
  },
  borderCard: {
    flexDirection: 'row',
    backgroundColor: '#243642',
    borderRadius: 5,
    marginTop: 20,
  },
  borderSection: {
    padding: 10,
    flexDirection: 'column',
    backgroundColor: '#243642',
    borderRadius: 5,
    width: '100%',
    zIndex: 0,
  },
  borderButton: {
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
  borderButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    padding: 20,
    fontFamily: 'RobotoCondensed-Bold',
    textAlign: 'center',
  },
  borderCancelButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    height: 60,
    width: 60,
    zIndex: 1,
    backgroundColor: 'red',
    borderWidth: 0,
    borderRadius: 5,
    borderColor: '#6482AD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropButton: {
    flex: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243642',
    margin: 2,
    width: '50%',
  },
  dropButtonText: {
    fontSize: 15,
    padding: 0,
    color: '#FFFFFF',
    fontFamily: 'RobotoCondensed-Regular',
  },
});
