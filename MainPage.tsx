import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {useState} from 'react';
import {useEffect} from 'react';
import Geolocation from '@react-native-community/geolocation';
import Geofencing from '@rn-bridge/react-native-geofencing';
import {ConvertToGeolib, GetBorderName, GetCountryCode} from './borders';
import * as geolib from 'geolib';
import Sound from 'react-native-sound';
import * as apiController from './ApiController.tsx';
import {routeEvent} from './Interfaces.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Logout} from './Dispatcher.tsx';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';

export default function Main() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentCoords, setCurrentCoords] = useState({lat: 0, lng: 0});
  const [enterToBorderZoneCoords, setEnterToBorderZoneCoords] = useState({
    lat: 0,
    lng: 0,
  });
  const [exitFromBorderZoneCoords, setExitFromBorderZoneCoords] = useState({
    lat: 0,
    lng: 0,
  });
  const [crossedBorderCoords, setCrossedBorderCoords] = useState({
    lat: 0,
    lng: 0,
  });
  const [crossingBorder, setCrossingBorder] = useState(false);
  const [currentCountryCode, setCurrentCountryCode] = useState<string | null>();
  const [startStopButtonTitle, setStartStopButtonTitle] = useState<string>('');
  const [startStopButtonColor, setStartStopButtonColor] = useState<string>('');
  const [started, setStarted] = useState(false);
  const borders = ConvertToGeolib();
  const [route, setRoute] = useState<routeEvent[]>([]);

  const getRoute = async () => {
    const route = await apiController.GetRoute();
    setRoute(route);
  };

  useEffect(() => {
    getRoute;
  }, []);
  useEffect(() => {
    if (started === true) {
      setStartStopButtonTitle('Zakończ');
      setStartStopButtonColor('#FF0000');
    } else {
      setStartStopButtonTitle('Rozpocznij');
      setStartStopButtonColor('#97BE5A');
    }
  });

  useEffect(() => {
    Geolocation.watchPosition(
      position => {
        setCurrentCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, maximumAge: 0, distanceFilter: 0},
    );
  });

  useEffect(() => {
    setTimeout(() => {
      const nearest = geolib.findNearest(
        {latitude: currentCoords.lat, longitude: currentCoords.lng},
        borders,
      );

      const distanceToNearestBorder = geolib.getPreciseDistance(
        {latitude: currentCoords.lat, longitude: currentCoords.lng},
        {
          latitude: geolib.getLatitude(nearest),
          longitude: geolib.getLongitude(nearest),
        },
      );

      if (distanceToNearestBorder < 50 && crossingBorder === false) {
        setEnterToBorderZoneCoords({
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        });
        setCrossedBorderCoords({
          lat: geolib.getLatitude(nearest),
          lng: geolib.getLongitude(nearest),
        });
        setCrossingBorder(true);
      }
      if (distanceToNearestBorder > 50 && crossingBorder === true) {
        setExitFromBorderZoneCoords({
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        });
        CrossingBorder();
        setCrossingBorder(false);
      }
    }, 100);
  });

  const CrossingBorder = async () => {
    const distance = geolib.getPreciseDistance(
      {
        latitude: exitFromBorderZoneCoords.lat,
        longitude: exitFromBorderZoneCoords.lng,
      },
      {
        latitude: enterToBorderZoneCoords.lat,
        longitude: enterToBorderZoneCoords.lng,
      },
    );

    if (distance > 50) {
      const currentCountry = currentCountryCode;
      const newCountry = GetCountryCode(
        crossedBorderCoords.lat,
        crossedBorderCoords.lng,
        currentCountryCode,
      );

      const border = `${currentCountry}/${newCountry}`;
      setCurrentCountryCode(newCountry);
      const borderName = GetBorderName(
        crossedBorderCoords.lat,
        crossedBorderCoords.lng,
      );

      const routeId = await AsyncStorage.getItem('routeId');
      if (routeId !== null) {
        const id = parseInt(routeId);
        const newEvent: routeEvent = {
          id: null,
          routeId: id,
          place: borderName,
          eventName: border,
          date: Date.now(),
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        };
        await apiController.NewEvent(id, newEvent);
        getRoute;
      }

      Sound.setCategory('Playback');
      var sound = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        sound.play();
      });
      sound.release();
    }
  };

  const handleClickStartStopButton = async () => {
    const geo = await Geofencing.getCurrentLocation();
    if (!started) {
      const routeId = await apiController.NewRoute();
      if (routeId !== null) {
        const newEvent: routeEvent = {
          id: null,
          routeId: routeId,
          place: geo.city,
          eventName: 'Beginning',
          date: Date.now(),
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        };
        await apiController.NewEvent(routeId, newEvent);
        getRoute;
        await AsyncStorage.setItem('routeId', routeId);
        setCurrentCountryCode(geo.isoCountryCode);
        setStartStopButtonTitle('Finish');
        setStartStopButtonColor('#FF0000');
        setStarted(true);
      }
    } else {
      const routeId = await AsyncStorage.getItem('routeId');
      if (routeId !== null) {
        const id = parseInt(routeId);
        const newEvent: routeEvent = {
          id: null,
          routeId: id,
          place: geo.city,
          eventName: 'Finished',
          date: Date.now(),
          lat: currentCoords.lat,
          lng: currentCoords.lng,
        };
        await apiController.NewEvent(id, newEvent);
        await apiController.FinishRoute(id);
      }
      setCurrentCountryCode(geo.isoCountryCode);
      setStartStopButtonTitle('Start');
      setStartStopButtonColor('#97BE5A');
      setStarted(false);
    }
  };

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View
        style={{
          flex: 0.5,
          justifyContent: 'center',
          width: '95%',
        }}>
        <Text
          style={{
            fontSize: 35,
            color: '#EEEEEE',
            fontFamily: 'Roboto-Black',
            opacity: 1,
          }}>
          DZIENNIK TRASY
        </Text>
      </View>

      <View
        style={{
          flex: 6,
          justifyContent: 'center',
          width: '95%',
        }}>
        <FlatList
          horizontal={false}
          showsVerticalScrollIndicator={false}
          style={{
            width: '100%',
          }}
          data={route}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <View style={{flex: 0.5, marginRight: 10}}></View>
              <View
                style={{
                  flex: 5,
                  backgroundColor: '#EEEEEE',
                  flexDirection: 'column',
                  paddingLeft: 10,
                  padding: 2,
                  elevation: 3,
                }}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Image
                    source={require('./assets/icons/start.png')}
                    style={{
                      resizeMode: 'contain',
                      height: '100%',
                      flex: 0.1,
                      opacity: 1,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 3,
                      fontSize: 30,
                      color: '#393E46',
                      fontFamily: 'Roboto-Regular',
                    }}>
                    {item.eventName}
                  </Text>
                </View>

                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Image
                    source={require('./assets/icons/loc.png')}
                    style={{
                      resizeMode: 'contain',
                      height: '100%',
                      flex: 0.1,
                      opacity: 1,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 3,
                      fontSize: 20,
                      color: '#393E46',
                      fontFamily: 'Roboto-Light',
                    }}>
                    {item.place}
                  </Text>
                </View>

                <View style={{flex: 1, flexDirection: 'row'}}>
                  <Image
                    source={require('./assets/icons/date.png')}
                    style={{
                      resizeMode: 'contain',
                      height: '100%',
                      flex: 0.1,
                      opacity: 1,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 3,
                      fontSize: 20,
                      color: '#393E46',
                      fontFamily: 'Roboto-Light',
                    }}>
                    {item.date}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      <View
        style={{
          flex: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={handleClickStartStopButton}
          style={{
            ...styles.StartStopButton,
            backgroundColor: startStopButtonColor,
          }}>
          <Text style={styles.ButtonText}>{startStopButtonTitle}</Text>
        </Pressable>
        <Pressable
          onPress={() => Logout(navigation)}
          style={styles.StartStopButton}>
          <Text style={styles.ButtonText}>WYLOGUJ</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    padding: 0,
    backgroundColor: '#151515',
  },
  StartStopButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 2,
    elevation: 3,
    width: '50%',
    height: '80%',
  },
  ButtonText: {
    fontFamily: 'Roboto-Regular',
    color: '#eaeaea',
    fontSize: 30,
  },
});
