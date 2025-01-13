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

const {width, height} = Dimensions.get('window'); // Pobieramy wymiary ekranu
const tileMargin = width * 0.02; // Margines dla kafelków
const infoTileHeightRatio = 0.05; // Kafelek pojazdu zajmuje 10% wysokości ekranu
const totalMarginHeight = tileMargin * 8; // Uwzględniamy marginesy między kafelkami i sekcjami

let deviceWidth = Dimensions.get('window').width;

export default function Menu() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentVehicle, setCurrentVehicle] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string | null>(
    'Firma XYZ',
  );

  const loadCurrentVehicle = async () => {
    const storedVehicle = await AsyncStorage.getItem('selectedVehicle');
    setCurrentVehicle(storedVehicle);
  };

  // Aktualizowanie pojazdu przy każdym wejściu na stronę
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentVehicle();
    }, []),
  );

  const handleTilePress = (route: keyof RootStackParamList) => {
    navigation.navigate(route); // Nawigacja do odpowiedniego ekranu
  };

  return (
    <View style={styles.container}>
      {/* Sekcja kafelków */}
      <View style={styles.tilesContainer}>
        <View style={styles.row1}>
          <Pressable
            style={styles.tile}
            onPress={() => handleTilePress('Main')}>
            <Text style={styles.tileText}>TRASA</Text>
          </Pressable>

          <Pressable
            style={styles.tile}
            onPress={() => handleTilePress('HistoriaTras')}>
            <Text style={styles.tileText}>HISTORIA</Text>
          </Pressable>
        </View>

        <View style={styles.row2}>
          <Pressable
            style={styles.tile}
            onPress={() => handleTilePress('Companies')}>
            <Text style={styles.tileText}>FIRMY</Text>
          </Pressable>

          <Pressable
            style={styles.tile}
            onPress={() => handleTilePress('Vehicles')}>
            <Text style={styles.tileText}>POJAZDY</Text>
          </Pressable>
        </View>
        <View style={styles.row3}>
          <Pressable
            style={styles.tile}
            onPress={() => handleTilePress('Ustawienia')}>
            <Text style={styles.tileText}>USTAWIENIA</Text>
          </Pressable>

          <Pressable
            style={{...styles.tile, backgroundColor: '#EE4E4E'}}
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
    backgroundColor: '#F5EDED',
    padding: 2,
    justifyContent: 'center',
  },
  tilesContainer: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  row1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row3: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tile: {
    backgroundColor: '#243642',
    width: deviceWidth / 2 - 2,
    height: '100%',
    borderWidth: 2,
    borderColor: '#F5EDED',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTile: {
    backgroundColor: '#161B22',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 0,
    marginBottom: tileMargin / 2,
    paddingLeft: 5,
  },
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tileMargin,
  },
  logo: {
    width: '60%',
    height: '60%',
  },

  logoutTile: {
    backgroundColor: '#D32F2F',
  },
  tileText: {
    color: '#C9D1D9',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  tileText2: {
    color: '#C9D1D9',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  infoText: {
    color: '#C9D1D9',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
});
