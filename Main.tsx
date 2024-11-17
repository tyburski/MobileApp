import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  Image,
  Button,
  StyleSheet,
  Pressable,
} from 'react-native';
import {useState} from 'react';
import {useEffect} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {ConvertToGeolib, GetBorderName, GetCountryCode} from './borders';
import * as geolib from 'geolib';
import Sound from 'react-native-sound';

function Main() {
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
  const [list, setList] = useState([{action: '', place: '', date: ''}]);
  const [startStopButtonTitle, setStartStopButtonTitle] = useState<string>('');
  const [startStopButtonColor, setStartStopButtonColor] = useState<string>(' ');
  const [started, setStarted] = useState(false);
  const borders = ConvertToGeolib();

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

  const CrossingBorder = () => {
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
      const date = new Date(Date.now()).toLocaleString();

      const newCrossing = {action: border, place: borderName, date: date};
      list.push(newCrossing);
      setList(list);

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

  const handleClickStartStopButton = () => {
    if (!started) {
      setList([{action: '', place: '', date: ''}]);

      const date = new Date(Date.now()).toLocaleString();
      const newEvent = {action: 'Rozpoczęcie trasy', place: '', date: date};
      list.push(newEvent);
      setList(list);
      setCurrentCountryCode('PL');
      setStartStopButtonTitle('Zakończ');
      setStartStopButtonColor('#FF0000');
      setStarted(true);
    } else {
      const date = new Date(Date.now()).toLocaleString();
      const newEvent = {action: 'Zakończenie trasy', place: '', date: date};
      list.push(newEvent);
      setCurrentCountryCode('PL');
      setList(list);
      setStartStopButtonTitle('Rozpocznij');
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
          data={list
            .filter(r => Object.values(r).some(c => c !== ''))
            .reverse()}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row', marginBottom: 10}}>
              <View style={{flex: 0.5, marginRight: 10}}>
                {(() => {
                  if (item.action === 'Rozpoczęcie trasy') {
                    return (
                      <Image
                        source={require('./assets/icons/cornerStart.png')}
                        style={{
                          resizeMode: 'cover',
                          height: 'auto',
                          width: 'auto',
                          flex: 1,
                          opacity: 1,
                        }}
                      />
                    );
                  } else if (item.action === 'Zakończenie trasy') {
                    return (
                      <Image
                        source={require('./assets/icons/cornerFinish.png')}
                        style={{
                          resizeMode: 'cover',
                          height: '100%',
                          width: 'auto',
                          flex: 1,
                          opacity: 1,
                        }}
                      />
                    );
                  } else {
                    return (
                      <Image
                        source={require('./assets/icons/borderLine.png')}
                        style={{
                          resizeMode: 'cover',
                          height: '100%',
                          width: 'auto',
                          flex: 1,
                          opacity: 1,
                        }}
                      />
                    );
                  }
                })()}
              </View>
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
                    {item.action}
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
          flex: 1,
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
export default Main;
