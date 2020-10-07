import {ReactNode} from 'react';

type BaseModalProps = {
  visible?: boolean;
  closeModal: () => void;
};

type ModalPropsList = {
  loading: {
    text: string;
  };
  'bottom-half': {
    renderContent: (props: {closeModal?: () => void}) => ReactNode;
  };
  options: {
    options: {text: string; onPress: () => void}[];
  };
};

type ModalVisibilityList = Record<keyof ModalPropsList, boolean>;
