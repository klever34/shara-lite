import {NavigationProp, ParamListBase} from '@react-navigation/native';

type AppNavigation = NavigationProp<ParamListBase>;

export interface INavigationService {
  getInstance(): AppNavigation | null;

  setInstance(navigation: AppNavigation): void;

  goToAuth(): void;
}

export class NavigationService implements INavigationService {
  private navigation: AppNavigation | null = null;

  public getInstance() {
    return this.navigation;
  }

  public setInstance(navigation: AppNavigation) {
    if (!this.navigation) {
      this.navigation = navigation;
    }
  }
  goToAuth() {
    this.navigation?.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  }
}
