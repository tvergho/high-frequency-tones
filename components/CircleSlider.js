/* eslint-disable no-mixed-operators */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import {
  PanResponder, Dimensions, StyleSheet, View,
} from 'react-native';
import Svg, {
  Path, Circle, G, Text,
} from 'react-native-svg';
import Ripple from 'react-native-material-ripple';

export default class CircleSlider extends Component {
  constructor(props) {
    super(props);

    if (this.props.function === 'Disable') {
      this.state = {
        angle: 141.267,
        rippleDisabled: true,
      };
    } else {
      this.state = {
        angle: 141.267,
        rippleDisabled: false,
      };
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gs) => true,
      onStartShouldSetPanResponderCapture: (e, gs) => true,
      onMoveShouldSetPanResponder: (e, gs) => true,
      onMoveShouldSetPanResponderCapture: (e, gs) => true,
      onPanResponderMove: (e, gs) => {
        const xOrigin = this.props.xCenter - (this.props.dialRadius + this.props.btnRadius);
        const yOrigin = this.props.yCenter - (this.props.dialRadius + this.props.btnRadius);
        const a = this.cartesianToPolar(gs.moveX - xOrigin, gs.moveY - yOrigin);

        if (this.state.angle > (this.props.min + 20) || a < (this.props.max / 2)) { // Checks if the current angle's between 0-20 and the user is trying to go between 180-360.
          if (Math.abs(this.state.angle - a) < 170) { // Ensures the user can't go from 359 -> 180 -> 0.
            if (a <= this.props.min) {
              this.setState({ angle: this.props.min });
            } else if (a >= this.props.max) {
              this.setState({ angle: this.props.max });
            } else {
              this.setState({ angle: a });
            }
            this.props.onValueChange(a);
          }
        }
      },
    });
  }

  componentDidUpdate(prevProps) {
    // Updates the angle along with the frequency while the user is directly editing.
    if ((this.props.freq !== prevProps.freq) && this.props.isEditing) {
      const newAngle = ((360 * this.props.freq) / 20000) - 1;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ angle: newAngle });
    }

    // Disables and enables the ripple button.
    if (this.props.function !== prevProps.function) {
      if (this.props.function === 'Disable') {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ rippleDisabled: true });
      } else {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ rippleDisabled: false });
      }
    }
  }

  // Controls center button behavior.
  centerButton = () => {
    if (this.props.function === 'Play') {
      this.props.play();
    } else if (this.props.function === 'Edit Frequency') {
      this.props.edit();
    }
  }

  polarToCartesian(angle) {
    const r = this.props.dialRadius;
    const hC = this.props.dialRadius + this.props.btnRadius;
    const a = (angle - 90) * Math.PI / 180.0;

    const x = hC + (r * Math.cos(a));
    const y = hC + (r * Math.sin(a));
    return { x, y };
  }

  cartesianToPolar(x, y) {
    const hC = this.props.dialRadius + this.props.btnRadius;

    if (x === 0) {
      return y > hC ? 0 : 180;
    } else if (y === 0) {
      return x > hC ? 90 : 270;
    } else {
      return (Math.round((Math.atan((y - hC) / (x - hC))) * 180 / Math.PI)
        + (x > hC ? 90 : 270));
    }
  }

  render() {
    const width = (this.props.dialRadius + this.props.btnRadius) * 2;
    const bR = this.props.btnRadius;
    const dR = this.props.dialRadius;
    const startCoord = this.polarToCartesian(0);
    const endCoord = this.polarToCartesian(this.state.angle);
    const withComma = this.props.freq.toLocaleString();

    return (
      <View>
        <Svg
          width={width}
          height={width}
        >
          <Circle r={dR}
            cx={width / 2}
            cy={width / 2}
            stroke={this.props.strokeColor}
            strokeWidth={this.props.strokeWidth}
            fill={this.props.fillColor}
          />
          <Text x={width / 2}
            y={width / 2}
            fill={this.props.textColor}
            textAnchor="middle"
            style={styles.hzText}
          >
            {`${withComma} Hz`}
          </Text>
          <Path stroke={this.props.meterColor}
            strokeWidth={this.props.dialWidth}
            fill="none"
            d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${this.state.angle > 180 ? 1 : 0} 1 ${endCoord.x} ${endCoord.y}`}
          />

          <G x={endCoord.x - bR} y={endCoord.y - bR}>
            <Circle r={bR}
              cx={bR}
              cy={bR}
              fill={this.props.meterColor}
              {...this._panResponder.panHandlers}
            />
          </G>
        </Svg>
        <Ripple
          onPress={this.centerButton}
          rippleContainerBorderRadius={150}
          rippleDuration={800}
          style={styles.ripple}
          rippleOpacity={0.8}
          hitSlop={{
            top: -35, bottom: -35, left: -35, right: -35,
          }}
          disabled={this.state.rippleDisabled}
        >
          <View style={styles.button} />
        </Ripple>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hzText: {
    fontSize: 60,
    fontFamily: 'System',
    fontWeight: '600',
  },
  button: {
    borderRadius: 150,
    width: 290,
    height: 290,
  },
  ripple: {
    position: 'absolute',
    overflow: 'hidden',
    top: 35,
    left: 35,
  },
});

CircleSlider.defaultProps = {
  btnRadius: 15,
  dialRadius: 130,
  dialWidth: 5,
  meterColor: '#0cd',
  textColor: '#fff',
  fillColor: 'none',
  strokeColor: '#fff',
  strokeWidth: 0.5,
  textSize: 10,
  value: 0,
  min: 0,
  max: 359,
  xCenter: Dimensions.get('window').width / 2,
  yCenter: Dimensions.get('window').height / 2,
  onValueChange: (x) => x,
};
