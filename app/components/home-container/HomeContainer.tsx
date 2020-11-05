import {FAButton} from '@/components';
import {applyStyles} from '@/styles';
import React from 'react';
import {
  DefaultSectionT,
  FlatList,
  SectionList,
  SectionListData,
  SectionListProps,
  SectionListRenderItem,
  Text,
  View,
  VirtualizedListProps,
} from 'react-native';
import {Button} from '../Button';
import EmptyState, {EmptyStateProps} from '../EmptyState';
import {HeaderRightMenuOption} from '../HeaderRight';
import {Icon} from '../Icon';
import {HomeContainerHeader} from './Header';
import {SearchFilter} from './SearchFilter';

type HomeContainerProps<T> = {
  activeFilter?: string;
  headerTitle?: string;
  headerAmount?: string;
  hasSections?: boolean;
  placeholderText?: string;
  onOpenFilter?: () => void;
  onCreateEntity?: () => void;
  searchPlaceholderText?: string;
  createEntityButtonText?: string;
  createEntityButtonIcon?: string;
  emptyStateProps?: EmptyStateProps;
  onSearch?: (text: string) => void;
  filterOptions?: HeaderRightMenuOption[];
  data?: T[] | SectionListData<T, DefaultSectionT>[];
  keyExtractor?: VirtualizedListProps<T>['keyExtractor'];
  renderListItem?: VirtualizedListProps<T>['renderItem'];
  renderSectionHeader?: SectionListProps<T>['renderSectionHeader'];
  initialNumToRender?: VirtualizedListProps<T>['initialNumToRender'];
  renderSectionListItem?: SectionListRenderItem<T, DefaultSectionT>;
};

export function HomeContainer<T>(props: HomeContainerProps<T>) {
  const {
    data,
    onSearch,
    hasSections,
    headerTitle,
    activeFilter,
    onOpenFilter,
    headerAmount,
    keyExtractor,
    filterOptions,
    onCreateEntity,
    renderListItem,
    emptyStateProps,
    initialNumToRender,
    renderSectionHeader,
    searchPlaceholderText,
    renderSectionListItem,
    createEntityButtonText,
    createEntityButtonIcon,
  } = props;

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <HomeContainerHeader
        title={headerTitle}
        amount={headerAmount}
        activeFilter={activeFilter}
        menuOptions={filterOptions}
      />
      <SearchFilter
        onSearch={onSearch}
        onOpenFilter={onOpenFilter}
        placeholderText={searchPlaceholderText}
      />
      {!!data && data.length ? (
        <>
          {hasSections ? (
            <SectionList
              //@ts-ignore
              sections={data}
              keyExtractor={keyExtractor}
              renderItem={renderSectionListItem}
              initialNumToRender={initialNumToRender}
              renderSectionHeader={renderSectionHeader}
            />
          ) : (
            <FlatList
              //@ts-ignore
              data={data}
              renderItem={renderListItem}
              keyExtractor={keyExtractor}
              initialNumToRender={initialNumToRender}
            />
          )}
          <FAButton
            style={applyStyles(
              'w-auto rounded-8 py-16 px-20 flex-row items-center',
            )}
            onPress={onCreateEntity}>
            <Icon
              size={20}
              color="white"
              type="feathericons"
              name={createEntityButtonIcon}
            />
            <Text
              style={applyStyles(
                'text-capitalize text-700 pl-sm text-base text-white',
              )}>
              {createEntityButtonText}
            </Text>
          </FAButton>
        </>
      ) : (
        <EmptyState
          imageStyle={applyStyles({width: 80, height: 80})}
          source={require('@/assets/images/emblem.png')}
          {...emptyStateProps}>
          {createEntityButtonText && (
            <Button
              style={applyStyles('mt-md mx-auto', {width: '90%'})}
              onPress={onCreateEntity}>
              <View
                style={applyStyles(
                  'w-auto rounded-8 py-16 px-20 flex-row items-center',
                )}>
                <Icon
                  size={20}
                  color="white"
                  type="feathericons"
                  name={createEntityButtonIcon}
                />
                <Text
                  style={applyStyles(
                    'text-capitalize text-700 pl-sm text-base text-white',
                  )}>
                  {createEntityButtonText}
                </Text>
              </View>
            </Button>
          )}
        </EmptyState>
      )}
    </View>
  );
}
