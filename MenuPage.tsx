import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function Menu() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userName, setUsername] = useState('');

  useEffect(() => {
    getUser();
  });
  const getUser = async () => {
    const name = await AsyncStorage.getItem('userName');
    if (name !== null) setUsername(name);
  };

  const handleTilePress = (route: keyof RootStackParamList) => {
    navigation.push(route);
  };

  async function Logout() {
    await AsyncStorage.setItem('token', '');
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  }

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
          <TouchableOpacity
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Main')}>
            <Text style={styles.tileText}>TRASA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('History')}>
            <Text style={styles.tileText}>HISTORIA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Companies')}>
            <Text style={styles.tileText}>FIRMY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Vehicles')}>
            <Text style={styles.tileText}>POJAZDY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tileHorizontal}
            onPress={() => handleTilePress('Settings')}>
            <Text style={styles.tileText}>USTAWIENIA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{...styles.tileHorizontal, backgroundColor: '#EE4E4E'}}
            onPress={() => Logout()}>
            <Text style={styles.tileText}>WYLOGUJ</Text>
          </TouchableOpacity>
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
