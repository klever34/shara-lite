import {useNavigation} from '@react-navigation/native';
import {FloatingAction} from 'react-native-floating-action';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, View, Image} from 'react-native';
import EmptyState from '../../../../components/EmptyState';
import Touchable from '../../../../components/Touchable';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {getProducts} from '../../../../services/ProductService';
import {IProduct} from '../../../../models/Product';
import {applyStyles} from '../../../../helpers/utils';

type ProductItemProps = {
  item: IProduct;
};

export function MyInventory() {
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const productsDB = getProducts({realm});
  const [products, setPoducts] = useState<IProduct[]>(productsDB);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const productsDB = getProducts({realm});
      setPoducts(productsDB);
    });
    return unsubscribe;
  }, [navigation, realm]);

  const actions = [
    {
      name: 'DeliveryAgents',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              View Delivery Agents
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../../assets/icons/business/users.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'Suppliers',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              View Suppliers
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../../assets/icons/business/user.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'ReceiveInventory',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Receive Inventory
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../../assets/icons/business/truck.png')}
            />
          </View>
        );
      },
    },
    {
      name: 'AddProduct',
      render: () => {
        return (
          <View style={styles.listItem}>
            <Text style={applyStyles(styles.listItemText, 'text-500')}>
              Add New Product
            </Text>
            <Image
              style={styles.listItemIcon}
              source={require('../../../../assets/icons/business/add.png')}
            />
          </View>
        );
      },
    },
  ];

  const handleProductItemClick = useCallback(
    (product) => {
      navigation.navigate('ViewProductDetails', {product});
    },
    [navigation],
  );

  const handleActionItemClick = useCallback(
    (name?: string) => {
      if (name) {
        navigation.navigate(name);
      }
    },
    [navigation],
  );

  const renderReceiptItem = useCallback(
    ({item: product}: ProductItemProps) => {
      return (
        <Touchable onPress={() => handleProductItemClick(product)}>
          <View
            style={applyStyles(
              'px-lg',
              'py-lg',
              'flex-row',
              'justify-space-between',
              {
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {product.name}
              </Text>
            </View>
            {!!product.quantity && (
              <View>
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 16,
                    color: colors.primary,
                  })}>
                  {product.quantity}
                </Text>
              </View>
            )}
          </View>
        </Touchable>
      );
    },
    [handleProductItemClick],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderReceiptItem}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={
          <EmptyState
            heading="No products"
            style={applyStyles({marginTop: 32})}
            source={require('../../../../assets/images/coming-soon.png')}
            text="Click the button below to add products"
          />
        }
      />

      <FloatingAction
        actions={actions}
        distanceToEdge={12}
        color={colors.primary}
        actionsPaddingTopBottom={4}
        onPressItem={handleActionItemClick}
        overlayColor="rgba(255,255,255,0.95)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fabButton: {
    height: 48,
    width: 'auto',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabButtonText: {
    fontSize: 16,
    paddingLeft: 8,
    color: colors.white,
    textTransform: 'uppercase',
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  listItemIcon: {
    height: 45,
    width: 45,
  },
  listItemText: {
    fontSize: 16,
    paddingRight: 12,
    color: colors['gray-300'],
  },
});
