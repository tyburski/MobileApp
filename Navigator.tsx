import {createStackNavigator} from '@react-navigation/stack';
import Main from './MainPage.tsx';
import Login from './LoginPage.tsx';
import {NavigationContainer} from '@react-navigation/native';

const MyStack = createStackNavigator({
  screens: {
    Main: Main,
    Login: Login,
  },
});

export default MyStack;
