import React, {Component} from 'react';
import {Text, Image} from 'react-native';
import ViewShot from 'react-native-view-shot';

type Props = {
  text: string;
  getImageUri?: (uri: any) => void;
};

type State = {
  uri: string | null;
};

export class ReceiptImage extends Component<Props, State> {
  state = {
    uri: '',
  };
  onCapture = (uri: any) => {
    console.log('do something with ', uri);
    this.setState({uri});
  };
  // componentDidUpdate(prevProps: Props, prevState: State) {
  //   if (prevState.uri !== this.state.uri && !!this.state.uri) {
  //     this.setState({
  //       uri: this.state.uri,
  //     });
  //   }
  // }
  render() {
    const {text} = this.props;
    console.log('state', this.state.uri);
    return (
      <ViewShot onCapture={this.onCapture} captureMode="mount">
        <Text>{text}</Text>
        {!this.state.uri && <Image source={{uri: this.state.uri}} />}
      </ViewShot>
    );
  }
}
