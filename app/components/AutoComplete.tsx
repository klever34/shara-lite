import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {Button} from './Button';
import Icon from './Icon';
import debounce from 'lodash/debounce';

export type AutoCompleteProps<T extends any = any> = {
  items: T[];
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  onFocus?: () => void;
  inputStyle?: ViewStyle;
  onBlur?: (query: string) => void;
  emptyStateText?: string;
  noResultsAction?: () => void;
  textInputProps?: TextInputProps;
  onItemSelect?: (item: T) => void;
  noResultsActionButtonText?: string;
  setFilter: (item: T, text: string) => boolean;
  onChangeText?: TextInputProps['onChangeText'];
  renderItem: ({
    item,
    onPress,
  }: {
    item: T;
    onPress: (item: T) => void;
  }) => React.ReactNode;
};

export function AutoComplete<T>({
  items,
  onBlur,
  label,
  onFocus,
  leftIcon,
  rightIcon,
  setFilter,
  inputStyle,
  renderItem,
  onChangeText,
  onItemSelect,
  textInputProps,
  noResultsAction,
  noResultsActionButtonText,
}: AutoCompleteProps<T>) {
  const queryRef = useRef<string>('');
  const [focus, setFocus] = useState(false);
  const [listItems, setListItems] = useState(items || []);

  const handleItemSelect = useCallback(
    (item) => {
      Keyboard.dismiss();
      setFocus(false);
      if (onItemSelect) {
        setTimeout(() => {
          onItemSelect(item);
        }, 10);
      }
    },
    [onItemSelect],
  );
  useEffect(() => {
    if (focus) {
      onFocus?.();
    } else {
      onBlur?.(queryRef.current);
    }
  }, [focus, onBlur, onFocus]);

  const handleInputFocus = useCallback(() => {
    setFocus(true);
    setListItems(items);
  }, [items]);

  const handleChangeText = useCallback(
    debounce((searchedText: string) => {
      queryRef.current = searchedText;
      const searchValue = searchedText.trim().toLowerCase();
      const results = items.filter((item: T) => {
        return setFilter && setFilter(item, searchValue);
      });
      setListItems(results);
      const onTextChange = onChangeText || textInputProps?.onChangeText;
      if (onTextChange && typeof onTextChange === 'function') {
        setTimeout(() => {
          onTextChange(searchedText);
        }, 0);
      }
    }, 750),
    [items, onChangeText, setFilter, textInputProps],
  );

  const renderFlatList = useCallback(() => {
    if (focus) {
      return (
        <View
          style={applyStyles('bg-white', {
            top: 80,
            height: 150,
            zIndex: 100,
            width: '100%',
            elevation: 10,
            borderRadius: 8,
            shadowRadius: 6.27,
            position: 'absolute',
            shadowOpacity: 0.34,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
          })}>
          <FlatList
            data={listItems}
            //@ts-ignore
            renderItem={({item}) =>
              renderItem({item, onPress: handleItemSelect})
            }
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <View
                style={applyStyles('px-lg flex-1 items-center justify-center', {
                  paddingVertical: 100,
                })}>
                <Text
                  style={applyStyles('mb-xs heading-700', 'text-center', {
                    color: colors['gray-300'],
                  })}>
                  No results found
                </Text>
                {noResultsAction && (
                  <Button
                    variantColor="clear"
                    onPress={noResultsAction}
                    style={applyStyles('w-full')}
                    title={noResultsActionButtonText}
                  />
                )}
              </View>
            }
          />
        </View>
      );
    }
  }, [
    focus,
    handleItemSelect,
    listItems,
    noResultsAction,
    noResultsActionButtonText,
    renderItem,
  ]);

  const renderTextInput = useCallback(() => {
    let style = styles.searchInput as ViewStyle;

    if (leftIcon) {
      style = {...style, paddingLeft: 48};
    }

    if (rightIcon) {
      style = {...style, paddingRight: 48};
    }

    return (
      <View>
        <View style={styles.searchInputContainer}>
          {leftIcon && (
            <Icon
              size={24}
              name={leftIcon}
              type="feathericons"
              style={styles.iconLeft}
              color={colors['gray-200']}
            />
          )}
          <TextInput
            onFocus={handleInputFocus}
            onChangeText={handleChangeText}
            placeholderTextColor={colors['gray-50']}
            style={applyStyles('text-400', style, inputStyle)}
            {...textInputProps}
          />
          {rightIcon && (
            <Icon
              size={24}
              name={rightIcon}
              type="feathericons"
              style={styles.iconRight}
              color={colors['gray-200']}
            />
          )}
        </View>
      </View>
    );
  }, [
    leftIcon,
    handleInputFocus,
    handleChangeText,
    inputStyle,
    textInputProps,
    rightIcon,
  ]);

  return (
    <View>
      {!!label && (
        <Text
          style={applyStyles(
            'text-xs text-uppercase text-500 text-gray-100 pb-8',
          )}>
          {label}
        </Text>
      )}
      {renderTextInput()}
      {renderFlatList()}
    </View>
  );
}

const styles = StyleSheet.create({
  searchInputContainer: {
    position: 'relative',
  },
  iconLeft: {
    top: 16,
    left: 12,
    elevation: 3,
    position: 'absolute',
  },
  iconRight: {
    top: 16,
    right: 12,
    elevation: 3,
    position: 'absolute',
  },
  searchInput: {
    height: 56,
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
  },
  emptyStateHeading: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  emptyStateDescription: {
    fontSize: 14,
    maxWidth: 300,
    textAlign: 'center',
    color: colors['gray-200'],
    marginHorizontal: 'auto',
  },
});
