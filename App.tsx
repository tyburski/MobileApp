import React from 'react';
import GeolocationPermission from './GeolocationPermission.tsx';
import {ValidateUser} from './Dispatcher.tsx';
import {Text, SafeAreaView} from 'react-native';
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
      <SafeAreaView>
        <Text style={{fontSize: 20}}>Ładowanie...</Text>
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
