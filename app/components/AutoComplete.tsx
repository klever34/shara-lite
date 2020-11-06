/*
  Code inspired by work done here
  https://github.com/zubairpaizer/react-native-searchable-dropdown/blob/master/index.js
*/

import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import Icon from './Icon';
import Touchable from './Touchable';

export type AutoCompleteProps<T extends any = any> = {
  items: T[];
  value: string;
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  onFocus?: () => void;
  selectionKey?: string;
  inputStyle?: ViewStyle;
  emptyStateText?: string;
  textInputProps?: TextInputProps;
  onBlur?: (query: string) => void;
  onItemSelect?: (item: T) => void;
  noResultsAction?: (query?: string) => void;
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
  label,
  value,
  onBlur,
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
}: AutoCompleteProps<T>) {
  const [query, setQuery] = useState<string>(value || '');
  const [focus, setFocus] = useState(false);
  const [listItems, setListItems] = useState(items || []);

  const handleItemSelect = useCallback(
    (item) => {
      Keyboard.dismiss();
      setFocus(false);
      if (onItemSelect) {
        onItemSelect(item);
      }
    },
    [onItemSelect],
  );

  const handleInputFocus = useCallback(() => {
    setListItems(items);
  }, [items]);

  const handleNoResultsAction = useCallback(
    (result: string) => {
      noResultsAction && noResultsAction(result);
      setFocus(false);
      Keyboard.dismiss();
    },
    [noResultsAction],
  );

  const handleChangeText = useCallback(
    (searchedText: string) => {
      if (searchedText.length) {
        setFocus(true);
      } else {
        setFocus(false);
      }
      setQuery(searchedText);
      const searchValue = searchedText.trim().toLowerCase();
      const results = items.filter((item: T) => {
        return setFilter && setFilter(item, searchValue);
      });
      setListItems(results);
      const onTextChange = onChangeText || textInputProps?.onChangeText;
      if (onTextChange && typeof onTextChange === 'function') {
        onTextChange(searchedText);
      }
    },
    [items, onChangeText, setFilter, textInputProps],
  );

  const renderFlatList = useCallback(() => {
    if (focus) {
      return (
        <View
          style={applyStyles('bg-white', {
            top: 60,
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
            height: listItems.length > 3 ? 150 : 'auto',
          })}>
          <FlatList
            data={listItems}
            persistentScrollbar
            initialNumToRender={5}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item, index) => index.toString()}
            //@ts-ignore
            renderItem={({item}) =>
              renderItem({item, onPress: handleItemSelect})
            }
            ListEmptyComponent={
              <Touchable
                onPress={
                  noResultsAction
                    ? () => handleNoResultsAction(query)
                    : undefined
                }>
                <View style={applyStyles('p-lg flex-row bg-gray-10')}>
                  <Text style={applyStyles('text-700 text-gray-300')}>
                    + Add
                  </Text>
                  <Text style={applyStyles('pl-xs text-700 text-primary')}>
                    {query}
                  </Text>
                </View>
              </Touchable>
            }
          />
        </View>
      );
    }
  }, [
    focus,
    query,
    listItems,
    renderItem,
    noResultsAction,
    handleItemSelect,
    handleNoResultsAction,
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
              color={colors['gray-50']}
            />
          )}
          <TextInput
            value={query}
            onFocus={handleInputFocus}
            onChangeText={handleChangeText}
            placeholderTextColor={colors['gray-50']}
            style={applyStyles('text-500', style, inputStyle)}
            {...textInputProps}
          />
          {rightIcon && (
            <Icon
              size={24}
              name={rightIcon}
              type="feathericons"
              style={styles.iconRight}
              color={colors['gray-50']}
            />
          )}
        </View>
      </View>
    );
  }, [
    leftIcon,
    rightIcon,
    query,
    handleInputFocus,
    handleChangeText,
    inputStyle,
    textInputProps,
  ]);

  useEffect(() => {
    if (focus) {
      onFocus?.();
    } else {
      onBlur?.(query);
    }
  }, [focus, onBlur, onFocus, query]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

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
