import React, {useCallback, useState} from 'react';
import {View, StyleSheet, TextInput, Text, Keyboard} from 'react-native';
import Icon from './Icon';
import {colors} from '../styles';
import Touchable from './Touchable';
import {applyStyles} from '../helpers/utils';
import {FlatList} from 'react-native-gesture-handler';

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
      return (
        <FlatList
          data={listItems}
          renderItem={renderItems}
          style={applyStyles(itemsContainerStyle)}
          keyExtractor={(item, index) => index.toString()}
        />
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
            type="ionicons"
            name="ios-search"
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
});

export default SearchableDropdown;
