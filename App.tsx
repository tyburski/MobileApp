import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  FlatList,
  Pressable,
  Image,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import {useState} from 'react';
import {useEffect} from 'react';
import {useRef} from 'react';
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geofencing, {Events} from '@rn-bridge/react-native-geofencing';
import {ConvertToGeolib} from './borders';
import {GetByCoords} from './borders';
import * as geolib from 'geolib';
import Sound from 'react-native-sound';
import DeviceInfo from 'react-native-device-info';

function App() {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [enterBorderLat, setEnterBorderLat] = useState(0);
  const [enterBorderLng, setEnterBorderLng] = useState(0);
  const [nearestBorderLat, setNearestBorderLat] = useState(0);
  const [nearestBorderLng, setNearestBorderLng] = useState(0);
  const [passingBorderLat, setPassingBorderLat] = useState(0);
  const [passingBorderLng, setPassingBorderLng] = useState(0);
  const [nearestBorderName, setNearestBorderName] = useState<string | null>();
  const [distanceToNearest, setDistanceToNearest] = useState(0);
  const [dist, setDist] = useState(0);
  const [distToBorder, setDistToBorder] = useState(0);
  const [country, setCountry] = useState<string | null>();
  const [list, setList] = useState([{border: '', borderName: '', date: ''}]);
  const [passing, setPassing] = useState(false);
  const [passingBorder, setPassingBorder] = useState<string | null>();
  const borders = ConvertToGeolib();
  const [started, setStarted] = useState(false);
  const [buttonSource, setButtonSource] = useState(
    require('./assets/icons/startButton.png'),
  );
  const [batterySource, setBatterySource] = useState(
    require('./assets/icons/battery100.png'),
  );
  const [signalSource, setSignalSource] = useState(
    require('./assets/icons/signal4.png'),
  );
  const [accuracy, setAccuracy] = useState(0);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Geolocation Permission',
          message: 'Can we access your location?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      //console.log('granted', granted);
      if (granted === 'granted') {
        //console.log('You can use Geolocation');
        return true;
      } else {
        //console.log('You cannot use Geolocation');
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        Geolocation.watchPosition(
          position => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setAccuracy(position.coords.accuracy);
          },
          error => {
            console.log(error.code, error.message);
          },
          {enableHighAccuracy: true, maximumAge: 0, distanceFilter: 0},
        );
      }
    });
  };

  async function deviceInfo() {
    const blevel = await DeviceInfo.getBatteryLevel();
    const charging = await DeviceInfo.isBatteryCharging();
    if (charging) {
      setBatterySource(require('./assets/icons/batteryCH.png'));
    } else {
      if (blevel < 0.2) {
        setBatterySource(require('./assets/icons/battery20.png'));
      } else if (blevel > 0.2 && blevel < 0.5) {
        setBatterySource(require('./assets/icons/battery50.png'));
      } else if (blevel > 0.5 && blevel < 0.75) {
        setBatterySource(require('./assets/icons/battery75.png'));
      } else if (blevel > 0.75) {
        setBatterySource(require('./assets/icons/battery100.png'));
      }
    }

    if (accuracy < 1) {
      setSignalSource(require('./assets/icons/signal0.png'));
    } else if (accuracy > 1 && accuracy < 2) {
      setSignalSource(require('./assets/icons/signal1.png'));
    } else if (accuracy > 2 && accuracy < 3) {
      setSignalSource(require('./assets/icons/signal2.png'));
    } else if (accuracy > 3 && accuracy < 4) {
      setSignalSource(require('./assets/icons/signal3.png'));
    } else if (accuracy > 5) {
      setSignalSource(require('./assets/icons/signal4.png'));
    }
  }

  useEffect(() => {
    setTimeout(() => {
      getLocation();
      deviceInfo();
    }, 1000);
  });

  useEffect(() => {
    setTimeout(() => {
      const nearest = geolib.findNearest(
        {latitude: latitude, longitude: longitude},
        borders,
      );

      setNearestBorderLat(geolib.getLatitude(nearest));
      setNearestBorderLng(geolib.getLongitude(nearest));
      setNearestBorderName(
        GetByCoords(nearestBorderLat, nearestBorderLng, 'name'),
      );

      setDistanceToNearest(
        geolib.getPreciseDistance(
          {latitude: latitude, longitude: longitude},
          {
            latitude: geolib.getLatitude(nearest),
            longitude: geolib.getLongitude(nearest),
          },
        ),
      );

      if (distanceToNearest < 40 && passing === false) {
        setEnterBorderLat(latitude);
        setEnterBorderLng(longitude);
        setPassingBorder(nearestBorderName);
        setPassingBorderLat(nearestBorderLat);
        setPassingBorderLng(nearestBorderLng);
        setPassing(true);
      }
      if (distanceToNearest < 40 && passing) {
        setDistToBorder(
          geolib.getPreciseDistance(
            {latitude: latitude, longitude: longitude},
            {
              latitude: passingBorderLat,
              longitude: passingBorderLng,
            },
          ),
        );
        if (distToBorder > 40) {
          Passing();
        }
      }
    }, 100);
  });

  function Passing() {
    setDist(
      geolib.getPreciseDistance(
        {latitude: latitude, longitude: longitude},
        {
          latitude: enterBorderLat,
          longitude: enterBorderLng,
        },
      ),
    );
    console.log(dist);
    if (dist > 40) {
      const currentCountry = country;
      const newCountry = GetByCoords(
        passingBorderLat,
        passingBorderLng,
        country,
      );

      const border = `${currentCountry}/${newCountry}`;
      setCountry(newCountry);
      const borderName = GetByCoords(
        nearestBorderLat,
        nearestBorderLng,
        'name',
      );
      const date = new Date(Date.now()).toLocaleString();

      const newEvent = {border: border, borderName: borderName, date: date};
      list.push(newEvent);
      setList(list);

      Sound.setCategory('Playback');
      var whoosh = new Sound('beep.mp3', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        whoosh.play(success => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      });
      whoosh.release();

      setPassing(false);
    } else if (dist < 40) {
      setPassing(false);
    }
  }

  const handleClick = () => {
    if (!started) {
      const date = new Date(Date.now()).toLocaleString();
      setButtonSource(require('./assets/icons/stopButton.png'));
      const newEvent = {border: 'START', borderName: 'Kraków', date: date};
      list.push(newEvent);
      setCountry('PL');
      setList(list);
      setStarted(true);
    } else {
      const date = new Date(Date.now()).toLocaleString();
      setButtonSource(require('./assets/icons/startButton.png'));
      const newEvent = {border: 'KONIEC', borderName: 'Kraków', date: date};
      list.push(newEvent);
      setCountry('PL');
      setEnterBorderLat(0);
      setEnterBorderLng(0);
      setPassingBorder('');
      setPassingBorderLat(0);
      setPassingBorderLng(0);
      setList(list);
      setStarted(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#393E46',
        alignItems: 'center',
      }}>
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
          data={list
            .filter(r => Object.values(r).some(c => c !== ''))
            .reverse()}
          renderItem={({item}) => (
            <View
              style={{
                marginBottom: 20,
                borderRadius: 5,
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
                    fontSize: 35,
                    color: '#393E46',
                    fontFamily: 'Roboto-Black',
                  }}>
                  {item.border}
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
                    fontSize: 30,
                    color: '#393E46',
                    fontFamily: 'Roboto-Light',
                  }}>
                  {item.borderName}
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
                    fontSize: 25,
                    color: '#393E46',
                    fontFamily: 'Roboto-Light',
                  }}>
                  {item.date}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flex: 3,
            alignItems: 'flex-end',
            flexDirection: 'column',
            padding: 10,
            paddingTop: 0,
          }}>
          <Image
            source={batterySource}
            style={{
              resizeMode: 'contain',
              height: '100%',
              flex: 1,
            }}
          />
          <Image
            source={signalSource}
            style={{
              resizeMode: 'contain',
              height: '100%',
              flex: 0.7,
            }}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableWithoutFeedback onPress={handleClick}>
            <Image
              source={buttonSource}
              style={{
                resizeMode: 'contain',
                height: '100%',
                width: '100%',
                opacity: 1,
              }}
            />
          </TouchableWithoutFeedback>
        </View>

        <View style={{flex: 3}}>
          <Text></Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default App;
