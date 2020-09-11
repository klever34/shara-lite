declare module 'react-native-config' {
  export const app_name: string;
  export const PUBNUB_SUB_KEY: string;
  export const PUBNUB_PUB_KEY: string;
  export const PUBNUB_USER_CRYPT_KEY: string;

  export const ATLAS_REALM_APP_ID: string;

  export const IP_GEOLOCATION_KEY: string;

  export const SENTRY_DSN: string;

  export const SEGMENT_KEY: string;

  export const UXCAM_KEY: string;

  export const CI_TESTS: string;

  export const ENVIRONMENT:
    | 'delivery'
    | 'test'
    | 'qa'
    | 'discovery'
    | 'production'
    | 'local';
  export const API_BASE_URL: string;
}
