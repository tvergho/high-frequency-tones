import React from 'react';
import { View, StyleSheet } from 'react-native';
import FrequencyGenerator from './components/frequency_generator';

// disable really annoying in app warnings
console.disableYellowBox = true;

export default function App() {
  return (
    <View style={styles.background}>
      <FrequencyGenerator />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#21232b',
  },
});
