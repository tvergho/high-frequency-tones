/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  StyleSheet, View, Text,
} from 'react-native';
import { Input, Button } from 'react-native-elements';

class FrequencyEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      freq: '',
    };
  }

  onChangeText = (value) => {
    const removeDec = value.replace('.', '');
    const newText = removeDec.replace(/\D/g, '');
    if (parseInt(newText, 10) <= 20000 || newText === '') {
      this.setState({ freq: newText }, () => this.props.onChange(this.state.freq));
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          type="clear"
          title="Close"
          titleStyle={styles.closeTitle}
          containerStyle={styles.closeContainer}
          onPress={this.props.close}
        />
        <Input
          placeholder="New Frequency"
          onChangeText={this.onChangeText}
          value={this.state.freq}
          containerStyle={{ marginTop: 20 }}
          keyboardType="numeric"
        />
        <Text style={styles.info}>Maximum 20,000 Hz.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  closeTitle: {
    color: 'black',
  },
  closeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  info: {
    marginLeft: 8,
    color: 'rgba(0,0,0,0.5)',
  },
});

export default FrequencyEditor;
