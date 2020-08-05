import React, {useCallback, useState} from 'react';
import {View, StyleSheet, TextInput, Text, Keyboard} from 'react-native';
import Icon from './Icon';
import {colors} from '../styles';
import Touchable from './Touchable';
import {applyStyles} from '../helpers/utils';
import {FlatList} from 'react-native-gesture-handler';
import {Button} from './Button';

//TODO: Type component props
const SearchableDropdown = (props: any) => {
  const {
    items,
    setSort,
    onFocus,
    itemStyle,
    searchTerm,
    onChangeText,
    onItemSelect,
    itemTextStyle,
    textInputProps,
    emptyStateText,
    noResultsAction,
    noResultsActionButtonText,
    itemsContainerStyle,
  } = props;
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState<any>({});
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
    setValue({});
    setFocus(true);
    setListItems(items);
  }, [onFocus, items]);

  const searchedItems = (searchedText: string) => {
    let sort = setSort;
    if (!sort && typeof sort !== 'function') {
      sort = (item: any, text: string) => {
        return item[searchTerm].toLowerCase().indexOf(text.toLowerCase()) > -1;
      };
    }
    var ac = items.filter((item: any) => {
      return sort(item, searchedText);
    });
    setListItems(ac);
    const onTextChange = onChangeText || textInputProps.onChangeText;
    if (onTextChange && typeof onTextChange === 'function') {
      setTimeout(() => {
        onTextChange(searchedText);
      }, 0);
    }
  };

  const renderFlatList = () => {
    if (focus) {
      return listItems.length ? (
        <FlatList
          data={listItems}
          renderItem={renderItems}
          style={applyStyles(itemsContainerStyle)}
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
      );
    }
  };

  const renderItems = ({item}: any) => {
    return (
      <Touchable onPress={() => handleItemSelect(item)}>
        <View style={applyStyles(styles.listItem, itemStyle)}>
          <Text
            style={applyStyles(styles.listItemText, itemTextStyle, 'text-400')}>
            {item[searchTerm]}
          </Text>
        </View>
      </Touchable>
    );
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
            onFocus={handleInputFocus}
            value={value[searchTerm]}
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
};

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
  listItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  listItemText: {
    fontSize: 16,
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
