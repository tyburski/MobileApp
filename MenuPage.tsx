import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {RootStackParamList} from './types';
import {NavigationProp} from '@react-navigation/native';
import {Logout} from './Dispatcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window'); // Pobieramy wymiary ekranu
const tileMargin = width * 0.02; // Margines dla kafelków
const logoHeightRatio = 0.3; // Logo zajmuje 30% wysokości ekranu
const infoTileHeightRatio = 0.05; // Kafelek pojazdu zajmuje 10% wysokości ekranu
const totalMarginHeight = tileMargin * 8; // Uwzględniamy marginesy między kafelkami i sekcjami

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

  // Dynamiczne obliczenie wysokości kafelków
  const availableHeight =
    height -
    height * logoHeightRatio -
    height * infoTileHeightRatio * 2 -
    totalMarginHeight;
  const tileHeight = availableHeight / 6; // Wysokość kafelków dla układu 1x6

  const handleTilePress = (route: keyof RootStackParamList) => {
    navigation.navigate(route); // Nawigacja do odpowiedniego ekranu
  };

  return (
    <View style={styles.container}>
      {/* Kafelek z aktualnym pojazdem */}
      {currentVehicle && (
        <View style={[styles.infoTile, {height: height * infoTileHeightRatio}]}>
          <Text style={styles.infoText}>🚗 {currentVehicle}</Text>
        </View>
      )}

      {/* Kafelek z aktualną firmą */}
      <View style={[styles.infoTile, {height: height * infoTileHeightRatio}]}>
        <Text style={styles.infoText}>🏢 {currentCompany}</Text>
      </View>

      {/* Sekcja logo */}
      <View style={[styles.logoSection, {height: height * logoHeightRatio}]}>
        <Image
          source={require('./assets/logo.png')} // Ścieżka do logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Sekcja kafelków */}
      <View style={styles.tilesContainer}>
        <TouchableOpacity
          style={[styles.tile, {height: tileHeight}]}
          onPress={() => handleTilePress('Main')}>
          <Text style={styles.tileText}>
            A<Text style={styles.tileText2}>KTUALNA TRASA</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, {height: tileHeight}]}
          onPress={() => handleTilePress('HistoriaTras')}>
          <Text style={styles.tileText}>
            H<Text style={styles.tileText2}>ISTORIA TRAS</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, {height: tileHeight}]}
          onPress={() => handleTilePress('Firmy')}>
          <Text style={styles.tileText}>
            F<Text style={styles.tileText2}>IRMY</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, {height: tileHeight}]}
          onPress={() => handleTilePress('Vehicles')}>
          <Text style={styles.tileText}>
            P<Text style={styles.tileText2}>OJAZDY</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, {height: tileHeight}]}
          onPress={() => handleTilePress('Ustawienia')}>
          <Text style={styles.tileText}>
            U<Text style={styles.tileText2}>STAWIENIA</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, styles.logoutTile, {height: tileHeight}]}
          onPress={() => Logout(navigation)}>
          <Text style={styles.tileText}>
            W<Text style={styles.tileText2}>YLOGUJ</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    padding: tileMargin,
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
  tilesContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tile: {
    backgroundColor: '#243642',
    width: '100%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTile: {
    backgroundColor: '#D32F2F',
  },
  tileText: {
    color: '#C9D1D9',
    fontSize: 30,
    fontFamily: 'RobotoCondensed-Black',
    textAlign: 'center',
  },
  tileText2: {
    color: '#C9D1D9',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Black',
    textAlign: 'center',
  },
  infoText: {
    color: '#C9D1D9',
    fontSize: 25,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
});
