import {Button, CurrencyInput} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {IReceiptItem} from '@/models/ReceiptItem';
import {colors} from '@/styles';
import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';

type Props = {
  item?: IReceiptItem;
  onDelete?: () => void;
  closeModal: () => void;
  onDone: (item: IReceiptItem) => void;
};

type SectionProps = {
  onPrevious?(): void;
  receiptItem: IReceiptItem;
  onNext(data: string | number, key: string): void;
};

const sectionTitle = {
  0: 'Item',
  1: 'Unit Price',
  2: 'Quantity',
} as {[key: number]: string};

const SectionButtons = ({
  onNext,
  onPrevious,
  nextButtonText,
  previousButtonText,
  nextButtonDisabled,
}: {
  onNext(): void;
  onPrevious?(): void;
  nextButtonText: string;
  previousButtonText?: string;
  nextButtonDisabled?: boolean;
}) => {
  const positionStyle = onPrevious ? 'justify-space-between' : 'justify-end';
  return (
    <View
      style={applyStyles('px-md py-sm flex-row', positionStyle, {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: colors['gray-50'],
        borderBottomColor: colors['gray-50'],
      })}>
      {onPrevious && (
        <Button variantColor="clear" onPress={onPrevious}>
          <View
            style={applyStyles('p-md flex-row center', {
              borderWidth: 1,
              borderRadius: 8,
              borderColor: colors['gray-200'],
            })}>
            <Icon
              size={16}
              type="feathericons"
              name="chevron-left"
              color={colors['gray-200']}
            />
            <Text style={applyStyles('text-500', {color: colors['gray-200']})}>
              {previousButtonText}
            </Text>
          </View>
        </Button>
      )}
      <Button
        disabled={nextButtonDisabled}
        variantColor="clear"
        onPress={onNext}>
        <View
          style={applyStyles('p-md flex-row center', {
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          })}>
          <Text style={applyStyles('text-500 text-white')}>
            {nextButtonText}
          </Text>
          <Icon
            size={16}
            type="feathericons"
            name="chevron-right"
            color={colors.white}
          />
        </View>
      </Button>
    </View>
  );
};

const ItemNameSection = ({onNext, receiptItem}: SectionProps) => {
  const [name, setName] = useState(receiptItem.name || '');

  const handleNameChange = useCallback((value) => {
    setName(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pt-16 pb-96')}>
        <TextInput
          value={name}
          onChangeText={(text) => handleNameChange(text)}
          style={applyStyles('px-12 py-0', {fontSize: 16})}
          placeholder="Enter item name here..."
        />
      </View>
      <SectionButtons
        nextButtonText="Unit Price"
        nextButtonDisabled={!name}
        onNext={() => onNext(name, 'name')}
      />
    </View>
  );
};

const ItemUnitPriceSection = ({
  onNext,
  receiptItem,
  onPrevious,
}: SectionProps) => {
  const [price, setPrice] = useState(receiptItem.price || 0);

  const handlePriceChange = useCallback((value) => {
    setPrice(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pb-96')}>
        <View style={applyStyles('mx-12 py-0', {fontSize: 16})}>
          <CurrencyInput
            value={price.toString()}
            inputStyle={applyStyles({borderBottomWidth: 0, paddingTop: 12})}
            onChange={(text) => handlePriceChange(text)}
            placeholder="Enter item unit price here..."
          />
        </View>
      </View>
      <SectionButtons
        onPrevious={onPrevious}
        nextButtonText="Quantity"
        nextButtonDisabled={!price}
        previousButtonText="Item Name"
        onNext={() => onNext(price, 'price')}
      />
    </View>
  );
};

const ItemQuantitySection = ({
  onNext,
  receiptItem,
  onPrevious,
}: SectionProps) => {
  const [quantity, setQuantity] = useState(
    (receiptItem.quantity && receiptItem.quantity.toString()) || '',
  );

  const handleQuantityChange = useCallback((value) => {
    setQuantity(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pt-16 pb-96')}>
        <TextInput
          value={quantity}
          keyboardType="numeric"
          onChangeText={(text) => handleQuantityChange(text)}
          style={applyStyles('px-12 py-0', {fontSize: 16})}
          placeholder="Enter quantity here..."
        />
      </View>

      <SectionButtons
        nextButtonText="Done"
        onPrevious={onPrevious}
        nextButtonDisabled={!quantity}
        previousButtonText="Unit Price"
        onNext={() => onNext(quantity, 'quantity')}
      />
    </View>
  );
};

export const ReceiptItemModalContent = (props: Props) => {
  const {item, closeModal, onDone, onDelete} = props;
  const [section, setSection] = useState(0);
  const [receiptItem, setReceiptItem] = useState<IReceiptItem>(
    item || ({} as IReceiptItem),
  );

  const handlePrevious = useCallback(() => {
    if (section > 0) {
      setSection(section - 1);
    }
  }, [section]);

  const handleNext = useCallback(
    (data: string | number, key: string) => {
      const payload = {
        ...receiptItem,
        product: {
          ...receiptItem,
          [key]: data,
        },
        [key]: data,
      };
      if (section < 2) {
        setReceiptItem(payload);
        setSection(section + 1);
      } else {
        setReceiptItem(payload);
        onDone(payload);
        closeModal();
      }
    },
    [section, onDone, closeModal, receiptItem],
  );

  return (
    <View>
      <View
        style={applyStyles(
          'bg-white flex-row items-center justify-space-between',
          {
            height: 80,
            elevation: 3,
          },
        )}>
        <Touchable onPress={closeModal}>
          <View
            style={applyStyles('px-md flex-row items-center', {height: 48})}>
            <Icon type="feathericons" name="arrow-left" size={24} />
            <Text
              style={applyStyles('pl-sm text-500', {
                fontSize: 18,
                color: colors['gray-300'],
              })}>
              {sectionTitle[section]}
            </Text>
          </View>
        </Touchable>
        {onDelete && (
          <Touchable onPress={onDelete}>
            <View style={applyStyles('px-md flex-row center', {height: 48})}>
              <Icon
                size={24}
                name="trash-2"
                type="feathericons"
                color={colors.primary}
              />
            </View>
          </Touchable>
        )}
      </View>
      <View>
        {section === 0 && (
          <ItemNameSection receiptItem={receiptItem} onNext={handleNext} />
        )}
        {section === 1 && (
          <ItemUnitPriceSection
            onNext={handleNext}
            receiptItem={receiptItem}
            onPrevious={handlePrevious}
          />
        )}
        {section === 2 && (
          <ItemQuantitySection
            onNext={handleNext}
            receiptItem={receiptItem}
            onPrevious={handlePrevious}
          />
        )}
      </View>
    </View>
  );
};
