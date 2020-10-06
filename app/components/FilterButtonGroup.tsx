import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

type Props = {
  value: string;
  children: ReactNode;
  onChange: (value: string) => void;
};

const defaultContextValue = {
  value: '',
  onChange: () => {},
};

const FilterButtonGroupContext = createContext<
  Pick<Props, 'value' | 'onChange'>
>(defaultContextValue);

export const useFilterButtonGroup = () => {
  return useContext(FilterButtonGroupContext);
};

export const useFilterButtonGroupState = ({
  value: valueProp,
  onChange: onChangeProp,
}: Pick<Props, 'value' | 'onChange'>) => {
  const [value, setValue] = useState(valueProp || '');

  const onChange = useCallback(
    (text) => {
      setValue(text);
      onChangeProp(text);
    },
    [onChangeProp],
  );

  return {value, onChange};
};

export const FilterButtonGroup = (props: Props) => {
  const {children, value, onChange} = props;
  const contextValue = useFilterButtonGroupState({value, onChange});

  return (
    <FilterButtonGroupContext.Provider value={contextValue}>
      {children}
    </FilterButtonGroupContext.Provider>
  );
};
