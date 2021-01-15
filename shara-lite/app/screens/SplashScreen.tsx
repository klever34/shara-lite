import React, {useCallback, useEffect, useMemo} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, dimensions} from '../styles';
import {
  getAuthService,
  getNavigationService,
  getRemoteConfigService,
} from '@/services';
import {useNavigation} from '@react-navigation/native';
import {useInitRealm} from '@/services/realm';
import {version as currentVersion} from '../../package.json';
import {getI18nService} from '@/services';
const strings = getI18nService().strings;

const remoteConfigService = getRemoteConfigService();
let minimumVersion = remoteConfigService.getValue('minimumVersion').asString();
if (minimumVersion) {
  try {
    minimumVersion = JSON.parse(minimumVersion);
  } catch (e) {
    minimumVersion = '';
  }
}

const SplashScreen = () => {
  const navigation = useNavigation();
  const {initRealm} = useInitRealm();

  useEffect(() => {
    const navigationService = getNavigationService();
    navigationService.setInstance(navigation);
  });

  const shouldUpdateApp = useMemo(() => {
    if (!minimumVersion || !currentVersion) {
      return false;
    }
    const [minimumVersionNumber] = minimumVersion.split('-');
    const [currentVersionNumber] = currentVersion.split('-');
    let [minMajor, minMinor, minPatch] = minimumVersionNumber.split('.');
    let [major, minor, patch] = currentVersionNumber.split('.');
    if (Number(minMajor) !== Number(major)) {
      return Number(minMajor) > Number(major);
    } else if (Number(minMinor) !== Number(minor)) {
      return Number(minMinor) > Number(minor);
    } else if (Number(minPatch) !== Number(patch)) {
      return Number(minPatch) > Number(patch);
    }
    return false;
  }, []);

  const handleRedirect = useCallback(async () => {
    const authService = getAuthService();
    await authService.initialize();

    if (authService.isLoggedIn()) {
      try {
        initRealm();
      } catch (e) {
        Alert.alert(
          strings('alert.something_went_wrong'),
          strings('alert.clear_app_data'),
          [
            {
              text: strings('alert.ok'),
              onPress: () => {
                if (process.env.NODE_ENV === 'production') {
                  if (Platform.OS === 'android') {
                    BackHandler.exitApp();
                  }
                }
              },
            },
          ],
        );
      }
    }

    setTimeout(() => {
      if (shouldUpdateApp) {
        navigation.reset({
          index: 0,
          routes: [{name: 'UpdateShara'}],
        });
      } else if (authService.isLoggedIn()) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        });
      }
    }, 750);
  }, [initRealm, navigation, shouldUpdateApp]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/shara-lite_logo.png')}
        style={styles.image}
      />
      <Text style={styles.text}>{strings('shara_tagline')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: dimensions.fullWidth,
    height: dimensions.fullHeight,
    backgroundColor: colors.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '25%',
    marginBottom: 24,
    resizeMode: 'contain',
  },
  text: {
    color: colors.black,
    fontSize: 22,
    fontFamily: 'Roboto-Bold',
    maxWidth: 300,
    textAlign: 'center',
    lineHeight: 32,
  },
});

export default SplashScreen;
