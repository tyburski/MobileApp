import {createStackNavigator} from '@react-navigation/stack';
import {NavigationProp} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Menu: undefined;
  AktualnaTrasa: undefined;
  HistoriaTras: undefined;
  Firmy: undefined;
  Vehicles: undefined;
  Ustawienia: undefined;
  Logout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
