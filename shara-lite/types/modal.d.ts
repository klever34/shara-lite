import {ReactNode} from 'react';
import {SearchableDropdownProps} from '@/components/SearchableDropdown';
import {Direction, ModalProps} from 'react-native-modal';

type BaseModalProps = {
  visible?: boolean;
  closeModal: () => void;
};

type BottomHalfContentProps = {closeModal?: () => void};
type FullModalContentProps = {closeModal?: () => void};

type BaseModalOptions = {
  onCloseModal?: () => void;
};

type ModalOptionsList = {
  loading: Partial<ModalProps> &
    BaseModalOptions & {
      text: string;
    };
  'bottom-half': Partial<ModalProps> &
    BaseModalOptions & {
      animationInTiming?: number;
      animationOutTiming?: number;
      swipeDirection?: Direction | Array<Direction>;
      renderContent: (props: BottomHalfContentProps) => ReactNode;
      showHandleNub?: boolean;
    };
  full: Partial<ModalProps> &
    BaseModalOptions & {
      animationInTiming?: number;
      animationOutTiming?: number;
      renderContent: (props: FullModalContentProps) => ReactNode;
    };
  options: Partial<ModalProps> &
    BaseModalOptions & {
      options: {text: string; onPress: () => void}[];
    };
  search: Partial<ModalProps> & BaseModalOptions & SearchableDropdownProps;
};

type ModalVisibilityList = Record<keyof ModalOptionsList, boolean>;
