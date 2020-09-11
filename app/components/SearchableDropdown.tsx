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
import {applyStyles} from '../helpers/utils';
import {colors} from '../styles';
import {Button} from './Button';
import Icon from './Icon';

type Props<T> = {
  items: T[];
  onFocus?: () => void;
  emptyStateText?: string;
  noResultsAction?: () => void;
  textInputProps?: TextInputProps;
  onItemSelect?: (item: T) => void;
  noResultsActionButtonText?: string;
  setSort: (item: T, text: string) => void;
  onChangeText?: TextInputProps['onChangeText'];
  renderItem: ({
    item,
    onPress,
  }: {
    item: T;
    onPress: (item: T) => void;
  }) => React.ReactNode;
};

function SearchableDropdown<T>(props: Props<T>) {
  const {
    items,
    setSort,
    onFocus,
    renderItem,
    onChangeText,
    onItemSelect,
    textInputProps,
    emptyStateText,
    noResultsAction,
    noResultsActionButtonText,
  } = props;
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const [listItems, setListItems] = useState(items || []);

  const handleItemSelect = useCallback(
    (item) => {
      setValue(item);
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
    setValue('');
    setFocus(true);
    setListItems(items);
  }, [onFocus, items]);

  const searchedItems = (searchedText: string) => {
    setValue(searchedText);
    const searchValue = searchedText.trim();
    let sort = setSort;
    var ac = items.filter((item: T) => {
      return sort(item, searchValue);
    });
    setListItems(ac);
    const onTextChange = onChangeText || textInputProps?.onChangeText;
    if (onTextChange && typeof onTextChange === 'function') {
      setTimeout(() => {
        onTextChange(searchedText);
      }, 0);
    }
  };

  const renderFlatList = () => {
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
  };

  const renderTextInput = () => {
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            style={styles.searchInputIcon}
            type="feathericons"
            name="search"
            color={colors.primary}
          />
          <TextInput
            value={value}
            onFocus={handleInputFocus}
            onChangeText={searchedItems}
            placeholderTextColor={colors['gray-50']}
            style={applyStyles(styles.searchInput, 'text-400')}
            {...textInputProps}
          />
        </View>
      </View>
    );
  };

  return (
    <View>
      {renderTextInput()}
      {renderFlatList()}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    borderRadius: 8,
    paddingLeft: 36,
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
