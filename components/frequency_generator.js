/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  StyleSheet, View, Settings,
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import AwesomeButtonBlue from 'react-native-really-awesome-button/src/themes/blue';
import Modal from 'react-native-modal';
import CircleSlider from './CircleSlider';
import SettingView from './settings';
import FrequencyEditor from './edit_frequency';

const toneFile = require('./tone.html');

const incrementKey = 'increment';
const incrementValues = {
  Fluid: 1,
  '250 Hz': 250,
  '500 Hz': 500,
  '1000 Hz': 1000,
};

const centerButtonKey = 'centerButton';

class FrequencyGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      freq: 8000,
      isPlaying: false,
      isSettingsVisible: false,
      isEditorVisible: false,
      increment: '250 Hz',
      centerButton: 'Play',
    };
  }

  async componentDidMount() {
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

  toggleSetting = () => {
    this.setState((prevState) => {
      return {
        isSettingsVisible: !prevState.isSettingsVisible,
      };
    });
  }

  toggleEditor = () => {
    this.setState((prevState) => {
      return {
        isEditorVisible: !prevState.isEditorVisible,
      };
    });
  }

  settingChanged = (key) => {
    const val = Settings.get(key);
    if (key === incrementKey) {
      this.setState(() => {
        return {
          increment: val,
        };
      });
    }
    if (key === centerButtonKey) {
      this.setState(() => {
        return {
          centerButton: val,
        };
      });
    }
  }

  onEditFreq = (val) => {
    if (val !== '') {
      const newFreq = parseInt(val, 10);
      this.setState({ freq: newFreq });
    }
  }

  play = () => {
    if (!this.state.isPlaying) {
      const { freq } = this.state;
      this.webRef.injectJavaScript(`synth.triggerAttack("${freq}");`);
      this.setState(() => {
        return {
          isPlaying: true,
        };
      });
    } else {
      this.webRef.injectJavaScript('synth.triggerRelease();');
      this.setState(() => {
        return {
          isPlaying: false,
        };
      });
    }
  }

  changeFreq = (x) => {
    const divider = incrementValues[this.state.increment];

    const frequency = ((x / (360 / ((20000 - divider) / divider))) * divider) + divider;
    const roundedFreq = Math.round(frequency / divider) * divider;
    this.setState({
      freq: roundedFreq,
    });
    this.webRef.injectJavaScript(`synth.setNote("${roundedFreq}");`);
  }

  startButton() {
    if (this.state.isPlaying) {
      return (
        <AwesomeButtonBlue
          onPress={this.play}
          type="primary"
          width={300}
          textSize={24}
          textFontFamily="System"
          style={styles.playButton}
        >
          Stop
        </AwesomeButtonBlue>
      );
    } else {
      return (
        <AwesomeButtonBlue
          onPress={this.play}
          type="primary"
          width={300}
          textSize={24}
          textFontFamily="System"
          style={styles.playButton}
        >
          Play
        </AwesomeButtonBlue>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topButtons}>
          <Button
            type="clear"
            title="Edit Frequency"
            titleStyle={styles.editFreqTitle}
            onPress={this.toggleEditor}
          />
          <Button
            icon={(
              <Icon
                name="cog"
                type="font-awesome"
                color="#fff"
                size={35}
              />
            )}
            type="clear"
            onPress={this.toggleSetting}
          />
        </View>
        <CircleSlider
          meterColor="#61dafb"
          value={0}
          strokeWidth={5}
          strokeColor="#313042"
          freq={this.state.freq}
          onValueChange={(x) => this.changeFreq(x)}
          dialRadius={160}
          btnRadius={20}
          play={this.play}
          edit={this.toggleEditor}
          function={this.state.centerButton}
          isEditing={this.state.isEditorVisible}
        />
        {this.startButton()}
        <View style={{ height: 0 }}>
          <WebView
            source={toneFile}
            // eslint-disable-next-line no-return-assign
            ref={(r) => (this.webRef = r)}
            style={styles.webview}
            javaScriptEnabled
            useWebKit
          />
        </View>
        <Modal
          isVisible={this.state.isSettingsVisible}
          style={styles.settingsModal}
          onBackdropPress={this.toggleSetting}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          backdropTransitionOutTiming={0}
        >
          <SettingView close={this.toggleSetting} change={this.settingChanged} />
        </Modal>
        <Modal
          isVisible={this.state.isEditorVisible}
          onBackdropPress={this.toggleEditor}
          backdropTransitionOutTiming={0}
        >
          <FrequencyEditor onChange={this.onEditFreq} close={this.toggleEditor} />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#21232b',
  },
  webview: {
    display: 'none',
  },
  topButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    alignItems: 'flex-start',
    top: 50,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  settingsModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 0,
  },
  editFreqTitle: {
    color: 'white',
  },
  playButton: {
    marginTop: 20,
  },
});

export default FrequencyGenerator;
