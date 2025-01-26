import React from 'react';
import GeolocationPermission from './GeolocationPermission.tsx';
import {ValidateUser} from './Dispatcher.tsx';
import {Text, SafeAreaView, Animated, Easing} from 'react-native';
import Login from './LoginPage.tsx';
import Main from './MainPage.tsx';
import Menu from './MenuPage.tsx';
import Vehicle from './VehiclePage.tsx';
import Company from './CompanyPage.tsx';
import Settings from './SettingsPage.tsx';
import History from './HistoryPage.tsx';
import {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './types.tsx';

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | undefined
  >(undefined);
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

  useEffect(() => {
    const checkPermissionsAndValidate = async () => {
      const hasPermission = await GeolocationPermission();
      if (hasPermission) {
        const isValidUser = await ValidateUser();
        setInitialRoute(isValidUser ? 'Menu' : 'Login');
      } else {
        setInitialRoute('Login');
      }
    };

    checkPermissionsAndValidate();
  }, []);

  if (initialRoute === undefined) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}>
        <Animated.Image
          source={require('./assets/icons/loading.png')}
          style={{
            backgroundColor: 'transparent',
            resizeMode: 'contain',
            alignSelf: 'center',
            height: 100,
            width: 100,
            transform: [{rotate: spin}],
          }}></Animated.Image>
      </SafeAreaView>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="History"
          component={History}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Vehicles"
          component={Vehicle}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Companies"
          component={Company}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
