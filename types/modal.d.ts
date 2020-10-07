import {ReactNode} from 'react';
import {SearchableDropdownProps} from '@/components/SearchableDropdown';
import {Direction} from 'react-native-modal';

type BaseModalProps = {
  visible?: boolean;
  closeModal: () => void;
};

type BottomHalfContentProps = {closeModal?: () => void};
type FullModalContentProps = {closeModal?: () => void};

type ModalPropsList = {
  loading: {
    text: string;
  };
  'bottom-half': {
    swipeDirection?: Direction | Array<Direction>;
    renderContent: (props: BottomHalfContentProps) => ReactNode;
  };
  full: {
    renderContent: (props: FullModalContentProps) => ReactNode;
  };
  options: {
    options: {text: string; onPress: () => void}[];
  };
  search: SearchableDropdownProps;
};

type ModalVisibilityList = Record<keyof ModalPropsList, boolean>;
