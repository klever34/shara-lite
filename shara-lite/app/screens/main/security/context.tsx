import React, {ReactNode, useState} from 'react';

export const SecurityContext = React.createContext<{
  pinSet?: boolean;
  setPinSet?: (pinSet: boolean) => void;
}>({});

type SecurityProviderProps = {
  initialPinSet?: boolean;
  children: ReactNode;
};

export const SecurityProvider = ({
  initialPinSet,
  children,
}: SecurityProviderProps) => {
  const [pinSet, setPinSet] = useState(initialPinSet);

  return (
    <SecurityContext.Provider value={{pinSet, setPinSet}}>
      {children}
    </SecurityContext.Provider>
  );
};
