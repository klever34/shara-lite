import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
} from 'react-native';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {Button} from './Button';
import Icon from './Icon';
import debounce from 'lodash/debounce';

export type SearchableDropdownProps<T extends any = any> = {
  items: T[];
  onFocus?: () => void;
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
  renderItem,
  onChangeText,
  onItemSelect,
  textInputProps,
  emptyStateText,
  noResultsAction,
  noResultsActionButtonText,
}: SearchableDropdownProps<T>) {
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

  const handleInputFocus = useCallback(() => {
    onFocus && onFocus();
    setFocus(true);
    setListItems(items);
  }, [onFocus, items]);

  const searchedItems = useCallback(
    debounce((searchedText: string) => {
      const searchValue = searchedText.trim();
      const ac = items.filter((item: T) => {
        return setFilter(item, searchValue);
      });
      setListItems(ac);
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
            onChangeText={searchedItems}
            placeholderTextColor={colors['gray-50']}
            style={applyStyles(styles.searchInput, 'text-400')}
            {...textInputProps}
          />
        </View>
      </View>
    );
  }, [handleInputFocus, searchedItems, textInputProps]);

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
