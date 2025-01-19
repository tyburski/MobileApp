import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';
import {Logout} from './Dispatcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');
const tileMargin = width * 0.02;
let deviceWidth = Dimensions.get('window').width;

export default function Menu() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userName, setUsername] = useState('');

  useEffect(() => {
    getUser();
  });
  const getUser = async () => {
    const name = await AsyncStorage.getItem('userName');
    if (name !== null) setUsername(name);
  };

  const handleTilePress = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Image
            source={require('./assets/icons/userWhite.png')}
            style={styles.icon}
          />
          <Text style={styles.headerText}>{userName.toLocaleUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.logoSection}>
        <Image source={require('./assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.tilesContainer}>
        <View style={styles.row}>
          <Pressable
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Main')}>
            <Text style={styles.tileText}>TRASA</Text>
          </Pressable>

          <Pressable
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('HistoriaTras')}>
            <Text style={styles.tileText}>HISTORIA</Text>
          </Pressable>
          <Pressable
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Companies')}>
            <Text style={styles.tileText}>FIRMY</Text>
          </Pressable>

          <Pressable
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Vehicles')}>
            <Text style={styles.tileText}>POJAZDY</Text>
          </Pressable>
          <Pressable
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Settings')}>
            <Text style={styles.tileText}>USTAWIENIA</Text>
          </Pressable>

          <Pressable
            style={{...styles.tileHorizontal, backgroundColor: '#EE4E4E'}}
            onPress={() => Logout(navigation)}>
            <Text style={styles.tileText}>WYLOGUJ</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5EDED',
    padding: 20,
  },
  headerContainer: {
    height: 60,
    borderRadius: 25,
    alignContent: 'center',
    backgroundColor: '#938b8b',
  },
  header: {
    flex: 1,
    height: 60,
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 20,
    marginRight: -50,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  headerText: {
    width: '100%',
    color: '#F5EDED',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'center',
  },
  logoSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tilesContainer: {
    flex: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'flex-end',
  },
  row: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
  },
  tileHorizontal: {
    backgroundColor: '#0f3877',
    width: width * 0.9,
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  logoutTile: {
    backgroundColor: '#D32F2F',
  },
  tileText: {
    color: '#F5EDED',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
    textAlign: 'center',
  },
});
