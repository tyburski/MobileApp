import {createStackNavigator} from '@react-navigation/stack';
import {NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Menu: undefined;
  AktualnaTrasa: undefined;
  HistoriaTras: undefined;
  Companies: undefined;
  Vehicles: undefined;
  Settings: undefined;
  Logout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
