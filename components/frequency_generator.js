/* eslint-disable react/sort-comp */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  StyleSheet, View, Settings, Text,
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import AwesomeButtonBlue from 'react-native-really-awesome-button/src/themes/blue';
import Modal from 'react-native-modal';
import { AdMobBanner } from 'expo-ads-admob';
import SwitchSelector from 'react-native-switch-selector';
import * as StoreReview from 'expo-store-review';
import * as InAppPurchases from 'expo-in-app-purchases';
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
const premiumPurchased = 'premium';

class FrequencyGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      freq: 8000,
      isPlaying: false,
      isSettingsVisible: false,
      isEditorVisible: false,
      isAdModalVisible: false,
      increment: '250 Hz',
      centerButton: 'Play',
      isPremium: false,
      wave: 'sine',
    };
  }

  componentDidMount() {
    // Updates settings on app launch.
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
    console.log(Settings.get(premiumPurchased));
    if (Settings.get(premiumPurchased) !== undefined) {
      const val = Settings.get(premiumPurchased);
      if (val === 1) {
        this.setState(() => {
          return {
            isPremium: true,
          };
        });
      }
    }

    // Request App Store review.
    if (StoreReview.isAvailableAsync()) {
      StoreReview.requestReview();
    }

    // Set in-app purchase callback.
    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
      // Purchase was successful
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach((purchase) => {
          if (!purchase.acknowledged) {
            this.setPremium();
            InAppPurchases.finishTransactionAsync(purchase, true);
          }
        });
      } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        console.log('User canceled the transaction');
      } else if (responseCode === InAppPurchases.IAPResponseCode.DEFERRED) {
        console.log('User does not have permissions to buy but requested parental approval (iOS only)');
      } else {
        console.warn(`Something went wrong with the purchase. Received errorCode ${errorCode}`);
      }
    });
  }

  componentWillUnmount() {
    this.webRef.reload(); // Fixes weird auditory flickering on background load.
  }

  // Modal toggles.
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

  toggleAdModal = () => {
    this.setState((prevState) => {
      return {
        isAdModalVisible: !prevState.isAdModalVisible,
      };
    });
  }

  // Called when the user has changed a setting.
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

  // Updates the current frequency in real-time.
  onEditFreq = (val) => {
    if (val !== '') {
      const newFreq = parseInt(val, 10);
      this.setState({ freq: newFreq });
    }
  }

  play = async () => {
    if (!this.state.isPlaying) { // Starts playing.
      const { freq, wave } = this.state;
      this.webRef.injectJavaScript(`synth.oscillator.type = "${wave}";`);
      this.webRef.injectJavaScript(`synth.triggerAttack("${freq}");`);
      this.setState(() => {
        return {
          isPlaying: true,
        };
      });

      const hitRate = 0.2;
      if (Math.random() <= hitRate && !this.state.isPremium) {
        this.toggleAdModal();
      }
    } else { // Stops playing.
      this.webRef.injectJavaScript('synth.triggerRelease();');
      this.setState(() => {
        return {
          isPlaying: false,
        };
      });
      this.webRef.reload(); // Fixes bugs with WebView.
    }
  }

  changeFreq = (x) => {
    const divider = incrementValues[this.state.increment]; // Either 1, 250, 500, or 1000.

    // Convert angle (out of 360) to a frequency.
    const frequency = ((x / (360 / ((20000 - divider) / divider))) * divider) + divider;
    const roundedFreq = Math.round(frequency / divider) * divider;
    this.setState({
      freq: roundedFreq,
    });
    this.webRef.injectJavaScript(`synth.setNote("${roundedFreq}");`);
  }

  changeWave = (wave) => {
    this.setState({
      wave,
    });
    this.webRef.injectJavaScript(`synth.oscillator.type = "${wave}";`);
  }

  setPremium = () => {
    this.setState({ isPremium: true });
    Settings.set({ premium: 1 });
  }

  settingsModal() {
    return (
      <Modal
        isVisible={this.state.isSettingsVisible}
        style={styles.settingsModal}
        onBackdropPress={this.toggleSetting}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropTransitionOutTiming={0}
      >
        <SettingView
          close={this.toggleSetting}
          change={this.settingChanged}
          alreadyPremium={this.state.isPremium}
          restore={this.setPremium}
        />
      </Modal>
    );
  }

  editorModal() {
    return (
      <Modal
        isVisible={this.state.isEditorVisible}
        onBackdropPress={this.toggleEditor}
        backdropTransitionOutTiming={0}
      >
        <FrequencyEditor onChange={this.onEditFreq} close={this.toggleEditor} />
      </Modal>
    );
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

  adModal() {
    return (
      <Modal
        isVisible={this.state.isAdModalVisible}
        style={styles.adModal}
        onBackdropPress={this.toggleAdModal}
        backdropTransitionOutTiming={0}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View>
          <AdMobBanner
            bannerSize="mediumRectangle"
            adUnitID="ca-app-pub-3940256099942544/2934735716"
            servePersonalizedAds
            onDidFailToReceiveAdWithError={this.bannerError}
          />
          <Button
            containerStyle={styles.closeAd}
            icon={(
              <Icon
                name="times-circle"
                type="font-awesome"
                color="black"
                size={25}
              />
            )}
            type="clear"
            onPress={this.toggleAdModal}
          />
        </View>
      </Modal>
    );
  }

  switchOrAd() {
    if (this.state.isPremium) {
      return (
        <SwitchSelector
          options={[
            { label: 'Sine', value: 'sine' },
            { label: 'Sawtooth', value: 'sawtooth' },
            { label: 'Square', value: 'square' },
            { label: 'Triangle', value: 'triangle' },
          ]}
          style={styles.waveSelector}
          initial={0}
          buttonColor="#1775C8"
          onPress={this.changeWave}
        />
      );
    } else {
      return (
        <AdMobBanner
          bannerSize="fullBanner"
          adUnitID="ca-app-pub-3940256099942544/2934735716"
          servePersonalizedAds
          onDidFailToReceiveAdWithError={this.bannerError}
          style={styles.adBanner}
        />
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
        <Text style={styles.silentMode}>
          Make sure Silent Mode is turned off.
        </Text>
        <View style={{ height: 0 }}>
          <WebView
            source={toneFile}
            // eslint-disable-next-line no-return-assign
            ref={(r) => (this.webRef = r)}
            style={styles.webview}
            javaScriptEnabled
            useWebKit
            ignoreSilentHardwareSwitch
          />
        </View>
        {this.settingsModal()}
        {this.editorModal()}
        {this.adModal()}
        {this.switchOrAd()}
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
    top: 40,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  settingsModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: 0,
  },
  adModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editFreqTitle: {
    color: 'white',
  },
  playButton: {
    marginTop: 20,
  },
  adBanner: {
    position: 'absolute',
    bottom: 0,
  },
  silentMode: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 20,
  },
  waveSelector: {
    position: 'absolute',
    bottom: 40,
  },
  closeAd: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default FrequencyGenerator;
