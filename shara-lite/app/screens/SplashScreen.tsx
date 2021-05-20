import {Text} from '@/components';
import {
  getAuthService,
  getI18nService,
  getNavigationService,
  getRemoteConfigService,
} from '@/services';
import {useInitRealm} from '@/services/realm';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {version as currentVersion} from '../../package.json';
import {handleError} from '@/services/error-boundary';
import SharaLogo from '@/assets/images/shara-logo.svg';
import {applySpacing, colors, dimensions} from '../styles';
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
const authService = getAuthService();

const SplashScreen = () => {
  const navigation = useNavigation();
  const {initRealm: _initRealm} = useInitRealm();
  const initRealm = useRef(_initRealm).current;

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

  const initializeServices = useCallback(async () => {
    try {
      await getRemoteConfigService().initialize();
    } catch (e) {}
    try {
      await authService.initialize();
    } catch (e) {}
  }, []);

  const handleRedirect = useCallback(async () => {
    await initializeServices();
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
  }, [initRealm, initializeServices, navigation, shouldUpdateApp]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <View style={styles.container}>
      {/* <Image
        source={require('../assets/images/shara_logo.png')}
        style={styles.image}
      /> */}
      <View style={{alignSelf: 'center'}}>
        <SharaLogo width={350} height={300} />
      </View>
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
    height: '10%',
    marginBottom: applySpacing(24),
    resizeMode: 'contain',
  },
  text: {
    color: colors.black,
    fontSize: applySpacing(22),
    fontFamily: 'Roboto-Bold',
    maxWidth: applySpacing(300),
    textAlign: 'center',
    lineHeight: applySpacing(32),
  },
});

export default SplashScreen;
