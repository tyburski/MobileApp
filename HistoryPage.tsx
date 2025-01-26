import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {route} from './Interfaces';
import {getRoutes, generateReport} from './ApiController';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from './types';
import Moment from 'moment';

const {width} = Dimensions.get('window');

export default function HistoryPage() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [routes, setRoutes] = useState<route[] | undefined>();
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isLoadingModalError, setLoadingModalError] = useState(true);

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

  const fetchRoutes = async () => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const routes = await getRoutes();
    setLoadingModalVisible(false);
    setRoutes(routes);
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      fetchRoutes();
    }
  }, [isFocused]);

  const hanldeCloseLoadingModal = () => {
    setLoadingModalVisible(false);
  };

  const handleSendUser = async (id: number) => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const result = await generateReport(id, true);
    if (result === true) {
      setLoadingModalVisible(false);
      Alert.alert('', 'Raport został wysłany.');
    } else setLoadingModalError(true);
  };
  const handleSendCompany = async (id: number) => {
    setLoadingModalError(false);
    setLoadingModalVisible(true);
    const result = await generateReport(id, false);
    if (result === true) {
      setLoadingModalVisible(false);
      Alert.alert('', 'Raport został wysłany.');
    } else setLoadingModalError(true);
  };

  const calculateDateDifference = (
    startDateString?: string,
    endDateString?: string,
  ) => {
    if (!startDateString || !endDateString) {
      return {days: 0, hours: 0};
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    const differenceMs = endDate.getTime() - startDate.getTime();

    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (differenceMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    return {days, hours};
  };

  const renderVehicleItem = ({item}: {item: route}) => {
    const {days, hours} = calculateDateDifference(
      item.routeEvents?.[0]?.date.toString(),
      item.routeEvents?.[item.routeEvents.length - 1]?.date.toString(),
    );

    return (
      <View style={[styles.itemCard]}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 0,
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <View style={{flex: 1}}>
            <Text style={styles.itemLabel}>TRASA</Text>
            <Text style={styles.itemText}>
              {days}d {hours}h
            </Text>
          </View>

          <View style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{...styles.itemText, textAlign: 'right'}}>
              <Text style={styles.itemLabel}>Od </Text>
              {Moment(item.routeEvents?.[0]?.date).format('DD.MM.YYYY hh:mm')}
            </Text>
            <Text style={{...styles.itemText, textAlign: 'right'}}>
              <Text style={styles.itemLabel}>Do </Text>
              {Moment(
                item.routeEvents?.[item.routeEvents.length - 1]?.date,
              ).format('DD.MM.YYYY hh:mm')}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
          }}>
          <TouchableOpacity
            style={[styles.pressable, {flex: 1, marginHorizontal: 10}]}
            onPress={() => handleSendUser(item.id)}>
            <Text style={styles.pressableText}>WYŚLIJ DO SIEBIE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pressable, {flex: 1, marginHorizontal: 10}]}
            onPress={() => handleSendCompany(item.id)}>
            <Text style={styles.pressableText}>WYŚLIJ DO FIRMY</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={{...styles.menuButton, marginRight: 10}}
          onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.menuButtonText}>↲ POWRÓT</Text>
        </TouchableOpacity>
        <View
          style={{...styles.menuButton, backgroundColor: 'transparent'}}></View>
      </View>
      {routes !== undefined && routes.length > 0 && (
        <FlatList
          data={routes}
          renderItem={renderVehicleItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.itemList}
        />
      )}
      {routes === undefined ||
        (routes.length === 0 && (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              Wygląda na to, że nic tu nie ma!
            </Text>
          </View>
        ))}

      {/* Modal Loading*/}
      <Modal
        visible={isLoadingModalVisible}
        transparent={true}
        animationType="fade">
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
  },
  menuContainer: {
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 15,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  button: {
    width: '100%',
    height: 60,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f3877',
    borderRadius: 25,
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
  itemList: {
    paddingHorizontal: 15,
  },
  itemCard: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    padding: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#d2c6c6',
    borderRadius: 20,
    marginBottom: 20,
  },
  itemSection: {
    flex: 3,
    backgroundColor: 'transparent',
  },
  itemText: {
    flexDirection: 'column',
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Light',
  },
  removeButtonSection: {
    flex: 1,
    padding: 5,
  },
  itemLabel: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'RobotoCondensed-Regular',
  },
  pressable: {
    flex: 1,
    backgroundColor: '#938b8b',
    borderRadius: 25,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressableText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'RobotoCondensed-Regular',
    textAlign: 'center',
  },
  menuButton: {
    flex: 1,
    backgroundColor: '#938b8b',
    width: width * 0.9,
    height: 60,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputWrapper: {
    flexDirection: 'row',
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
});
