import {FAButton} from '@/components';
import {applyStyles} from '@/styles';
import React, {ReactNode, useCallback, useState} from 'react';
import {
  DefaultSectionT,
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SectionList,
  SectionListData,
  SectionListProps,
  SectionListRenderItem,
  Text,
  View,
  ViewStyle,
  VirtualizedListProps,
} from 'react-native';
import {Button} from '../Button';
import EmptyState, {EmptyStateProps} from '../EmptyState';
import {HeaderRightMenuOption, SearchFilter} from '@/components';
import {Icon} from '../Icon';
import {HomeContainerHeader} from './Header';
import {Fade} from '../Fade';

type HomeContainerProps<T> = {
  activeFilter?: string;
  headerTitle?: string;
  headerAmount?: string;
  headerImage?: ImageSourcePropType;
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
  showFAB?: boolean;
  moreHeader?: ReactNode;
  headerStyle?: ViewStyle;
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
    showFAB = true,
    headerImage,
    moreHeader = null,
    headerStyle,
  } = props;

  const [isHeaderShown, setIsHeaderShown] = useState(true);

  const handleShowHeader = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (e.nativeEvent.contentOffset.y > 0) {
        setIsHeaderShown(false);
      } else {
        setIsHeaderShown(true);
      }
    },
    [],
  );

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      {headerTitle && (
        <Fade visible={isHeaderShown}>
          <HomeContainerHeader
            title={headerTitle}
            amount={headerAmount}
            activeFilter={activeFilter}
            menuOptions={filterOptions}
            image={headerImage}
            style={headerStyle}
          />
        </Fade>
      )}
      {moreHeader}
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
              onScroll={handleShowHeader}
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
              onScroll={handleShowHeader}
              initialNumToRender={initialNumToRender}
            />
          )}
          {showFAB && (
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
          )}
        </>
      ) : (
        <EmptyState
          headingStyle={applyStyles('px-32')}
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
