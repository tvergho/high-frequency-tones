import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FrequencyGenerator from './components/frequency_generator';
import 'expo-asset';

// disable really annoying in app warnings
console.disableYellowBox = true;

const Stack = createStackNavigator();

const App = () => {
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
};

export default App;
