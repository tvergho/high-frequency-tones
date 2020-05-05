import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import FrequencyGenerator from './components/frequency_generator';
import 'expo-asset';

// disable really annoying in app warnings
console.disableYellowBox = true;

const Stack = createStackNavigator();

class App extends Component {
  componentDidMount() {
    setTimeout(() => SplashScreen.hide(), 200);
  }

  render() {
    return (
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator
          initialRouteName="Main"
        >
          <Stack.Screen
            name="Main"
            component={FrequencyGenerator}
            options={{
              title: 'High Frequency Tones',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
