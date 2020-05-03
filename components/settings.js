/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { Icon, Button } from 'react-native-elements';
import {
  StyleSheet, View, Text, Settings,
} from 'react-native';
import { SettingsDividerLong } from 'react-native-settings-components';
import SettingsPicker from './picker/picker';

const incrementKey = 'increment';
const centerButtonKey = 'centerButton';

class SettingView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      increment: '250 Hz',
      centerButton: 'Play',
    };
  }

  componentDidMount() {
    if (Settings.get(incrementKey) !== undefined) {
      const val = Settings.get(incrementKey);
      this.setState(() => {
        return {
          increment: val,
        };
      });
    }
    if (Settings.get(centerButtonKey) !== undefined) {
      const val = Settings.get(centerButtonKey);
      this.setState(() => {
        return {
          centerButton: val,
        };
      });
    }
  }

  onIncrementChange = (newVal) => {
    this.setState(() => {
      return {
        increment: newVal,
      };
    });
    Settings.set({ increment: newVal });
    this.props.change(incrementKey);
  }

  onCenterButtonChange = (newVal) => {
    this.setState(() => {
      return {
        centerButton: newVal,
      };
    });
    Settings.set({ centerButton: newVal });
    this.props.change(centerButtonKey);
  }

  stripFrequency = (val) => {
    if (val.includes('Frequency')) {
      return 'Edit';
    } else return val;
  }

  render() {
    return (
      <View style={styles.settingsContainer}>
        <Button
          containerStyle={styles.closeIcon}
          icon={(
            <Icon
              name="times-circle"
              type="font-awesome"
              color="black"
              size={35}
            />
          )}
          type="clear"
          onPress={this.props.close}
        />
        <Text style={styles.titleText}>Settings</Text>
        <SettingsPicker
          title="Dial Increment"
          dialogDescription="Change the sensitivity of the center dial."
          options={[
            { label: 'Fluid', value: 'Fluid' },
            { label: '250 Hz', value: '250 Hz' },
            { label: '500 Hz', value: '500 Hz' },
            { label: '1000 Hz', value: '1000 Hz' },
          ]}
          value={this.state.increment}
          onValueChange={this.onIncrementChange}
          modalStyle={{
            header: {
              wrapper: {
                backgroundColor: '#1775C8',
              },
            },
          }}
        />
        <SettingsDividerLong />
        <SettingsPicker
          title="Center Button"
          dialogDescription="Change what happens when tapping the center of the dial."
          options={[
            { label: 'Disable', value: 'Disable' },
            { label: 'Play', value: 'Play' },
            { label: 'Edit Frequency', value: 'Edit Frequency' },
          ]}
          value={this.state.centerButton}
          onValueChange={this.onCenterButtonChange}
          modalStyle={{
            header: {
              wrapper: {
                backgroundColor: '#1775C8',
              },
            },
          }}
          valueFormat={this.stripFrequency}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  settingsContainer: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '70%',
  },
  titleText: {
    fontWeight: '700',
    fontFamily: 'System',
    fontSize: 30,
    marginTop: 20,
    marginLeft: 40,
    marginBottom: 20,
  },
  closeIcon: {
    position: 'absolute',
    top: 35,
    left: 10,
  },
});

export default SettingView;
