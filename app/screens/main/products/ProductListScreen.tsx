import {Button, HeaderRight, HomeContainer} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {withModal} from '@/helpers/hocs';
import {numberWithCommas} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {getProducts, updateProduct} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, KeyboardAvoidingView, Text, View} from 'react-native';
import {EditProductModal} from './EditProductModal';

export const ProductListScreen = withModal(() => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const products = realm ? getProducts({realm}) : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [allProducts, setAllProducts] = useState(products || []);
  const [itemToEdit, setItemToEdit] = useState<IProduct | null>(null);
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const headerImage = business.profile_image?.url
    ? {
        uri: business.profile_image.url,
      }
    : require('@/assets/images/shara-user-img.png');

  const handleProductSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  const handleOpenEditProductModal = useCallback((item: IProduct) => {
    setItemToEdit(item);
  }, []);

  const handleCloseEditProductModal = useCallback(() => {
    setItemToEdit(null);
    setOpenEditModal(false);
  }, []);

  const handleCreateProduct = useCallback(() => {
    navigation.navigate('CreateProduct');
  }, [navigation]);

  const handleAddInventory = useCallback(
    (product: IProduct) => {
      navigation.navigate('AddInventory', {product});
    },
    [navigation],
  );

  const handleUpdateProduct = useCallback(
    (payload) => {
      if (itemToEdit) {
        updateProduct({realm, product: itemToEdit, updates: payload});
      }
    },
    [itemToEdit, realm],
  );

  const filteredProducts = useMemo(() => {
    let userProducts = (allProducts as unknown) as Realm.Results<
      IProduct & Realm.Object
    >;
    if (searchTerm) {
      userProducts = userProducts.filtered(`name CONTAINS[c] "${searchTerm}"`);
    }
    return (userProducts.sorted('created_at', true) as unknown) as IProduct[];
  }, [allProducts, searchTerm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: applyStyles('border-b-1', {
        elevation: 0,
      }),
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    type="feathericons"
                    color={colors['gray-300']}
                    name="box"
                    size={22}
                    borderRadius={12}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Products
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Help',
              onSelect: () => {
                Alert.alert(
                  'Coming Soon',
                  'This feature is coming in the next update',
                );
              },
            },
          ]}
        />
      ),
    });
  }, [navigation]);

  const renderListItem = useCallback(
    ({item}: {item: IProduct}) => {
      return (
        <View
          style={applyStyles({
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Touchable onPress={() => handleOpenEditProductModal(item)}>
            <View
              style={applyStyles('p-16 flex-row items-center justify-between')}>
              <View>
                <Text
                  style={applyStyles('text-700 text-gray-300 text-uppercase')}>
                  {item.name}
                </Text>
              </View>
              <View style={applyStyles('items-end')}>
                <View style={applyStyles('flex-row items-center')}>
                  <Text style={applyStyles('text-700 text-gray-300 pr-xs')}>
                    {item?.quantity && !(item?.quantity < 0)
                      ? numberWithCommas(item.quantity)
                      : 0}
                  </Text>
                  <Text
                    style={applyStyles(
                      'text-400 text-xs text-gray-100 text-uppercase',
                    )}>
                    left
                  </Text>
                </View>
              </View>
            </View>
          </Touchable>
          {item?._id?.toString() === itemToEdit?._id?.toString() && (
            <View
              style={applyStyles(
                'flex-row items-center py-12 px-16 bg-white justify-between',
              )}>
              <Button
                title="Edit"
                variantColor="transparent"
                style={applyStyles({
                  width: '48%',
                })}
                onPress={() => setOpenEditModal(true)}
              />
              <Button
                variantColor="blue"
                title="Receive Inventory"
                onPress={() => handleAddInventory(item)}
                style={applyStyles({
                  width: '48%',
                })}
              />
            </View>
          )}
        </View>
      );
    },
    [handleAddInventory, handleOpenEditProductModal, itemToEdit],
  );

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const myProducts = realm ? getProducts({realm}) : [];
      setAllProducts(myProducts);
      setBusiness(getAuthService().getBusinessInfo());
    });
  }, [navigation, realm]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <HomeContainer<IProduct>
        data={filteredProducts}
        initialNumToRender={10}
        headerImage={headerImage}
        headerTitle="total products"
        createEntityButtonIcon="box"
        onSearch={handleProductSearch}
        renderListItem={renderListItem}
        onCreateEntity={handleCreateProduct}
        createEntityButtonText="Add Product"
        searchPlaceholderText="Search Products"
        headerAmount={filteredProducts.length.toString()}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        emptyStateProps={{
          heading: 'Add your Products',
          text:
            "You have no products yet. Let's help you load your products to create receipts faster and monitor stock levels.",
        }}
      />
      <EditProductModal
        item={itemToEdit}
        visible={openEditModal}
        onClose={handleCloseEditProductModal}
        onUpdateProductItem={handleUpdateProduct}
      />
    </KeyboardAvoidingView>
  );
});
