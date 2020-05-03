import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FrequencyGenerator from './components/frequency_generator';

// disable really annoying in app warnings
console.disableYellowBox = true;

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
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
