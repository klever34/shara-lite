import {ReactNode} from 'react';

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
    renderContent: (props: BottomHalfContentProps) => ReactNode;
  };
  full: {
    renderContent: (props: FullModalContentProps) => ReactNode;
  };
  options: {
    options: {text: string; onPress: () => void}[];
  };
};

type ModalVisibilityList = Record<keyof ModalPropsList, boolean>;
