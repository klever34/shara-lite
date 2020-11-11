/*
  Code inspired by work done here
  https://github.com/zubairpaizer/react-native-searchable-dropdown/blob/master/index.js
*/

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {Button} from './Button';
import Icon from './Icon';
import debounce from 'lodash/debounce';

export type SearchableDropdownProps<T extends any = any> = {
  items: T[];
  onFocus?: () => void;
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

function SearchableDropdown<T>({
  items,
  setFilter,
  onFocus,
  onBlur,
  renderItem,
  onChangeText,
  onItemSelect,
  textInputProps,
  emptyStateText,
  noResultsAction,
  noResultsActionButtonText,
}: SearchableDropdownProps<T>) {
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
        return setFilter(item, searchValue);
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
          style={applyStyles({
            top: 60,
            zIndex: 100,
            elevation: 2,
            width: '100%',
            position: 'absolute',
            backgroundColor: colors.white,
          })}>
          {listItems.length ? (
            <FlatList
              data={listItems}
              //@ts-ignore
              renderItem={({item}) =>
                renderItem({item, onPress: handleItemSelect})
              }
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                <View
                  style={applyStyles(
                    'px-lg flex-1 items-center justify-center',
                    {
                      paddingVertical: 100,
                    },
                  )}>
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
          ) : (
            <View style={styles.emptyState}>
              <Text
                style={applyStyles(
                  'heading-700',
                  styles.emptyStateText,
                  styles.emptyStateHeading,
                )}>
                No results found
              </Text>
              <Text
                style={applyStyles(
                  'text-400',
                  styles.emptyStateText,
                  styles.emptyStateDescription,
                )}>
                {emptyStateText}
              </Text>
            </View>
          )}
        </View>
      );
    }
  }, [
    emptyStateText,
    focus,
    handleItemSelect,
    listItems,
    noResultsAction,
    noResultsActionButtonText,
    renderItem,
  ]);

  const renderTextInput = useCallback(() => {
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            style={styles.searchInputIcon}
            type="feathericons"
            name="search"
            color={colors['gray-200']}
          />
          <TextInput
            onFocus={handleInputFocus}
            onChangeText={handleChangeText}
            placeholderTextColor={colors['gray-50']}
            style={applyStyles(styles.searchInput, 'text-400')}
            {...textInputProps}
          />
        </View>
      </View>
    );
  }, [handleInputFocus, handleChangeText, textInputProps]);

  return (
    <View>
      {renderTextInput()}
      {renderFlatList()}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: colors.primary,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInputIcon: {
    top: 12,
    left: 10,
    elevation: 3,
    position: 'absolute',
  },
  searchInput: {
    height: 48,
    elevation: 2,
    fontSize: 16,
    paddingLeft: 48,
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

export default SearchableDropdown;
