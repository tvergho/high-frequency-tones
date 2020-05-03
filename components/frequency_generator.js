/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  StyleSheet, Button, View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CircleSlider from '../helpers/CircleSlider';
// import AssetUtils from 'expo-asset-utils';
// import * as FileSystem from 'expo-file-system';

const toneFile = require('./tone.html');

class FrequencyGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      freq: 17000,
      isPlaying: false,
    };
  }

  /*
    loadFile = async () => {
      // eslint-disable-next-line global-require
      const ToneHTML = await AssetUtils.resolveAsync(require('../assets/tone.html'));
      const fileContents = await FileSystem.readAsStringAsync(ToneHTML.localUri);
      this.editorHtml = fileContents;
    }
  */

  play = () => {
    if (!this.state.isPlaying) {
      const { freq } = this.state;
      this.setState(() => {
        this.webRef.injectJavaScript(`synth.triggerAttack("${freq}");`);
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

  render() {
    return (
      <View style={styles.container}>
        <CircleSlider
          meterColor="#61dafb"
          value={0}
        />
        <Button onPress={this.play} title="play" />
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    display: 'none',
  },
});

export default FrequencyGenerator;
