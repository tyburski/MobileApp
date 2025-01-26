import {createStackNavigator} from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Menu: undefined;
  History: undefined;
  Companies: undefined;
  Vehicles: undefined;
  Settings: undefined;
  Logout: undefined;
};

createStackNavigator<RootStackParamList>();
