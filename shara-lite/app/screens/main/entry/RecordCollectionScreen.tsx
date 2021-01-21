import {Button, DatePicker, toNumber} from '@/components';
import {CalculatorInput, CalculatorView} from '@/components/CalculatorView';
import {CircleWithIcon} from '@/components/CircleWithIcon';
import {CustomerListItem} from '@/components/CustomerListItem';
import {EditableInput} from '@/components/EditableInput';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import Touchable from '@/components/Touchable';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {MainStackParamList} from '@/screens/main';
import {getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors, dimensions} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format, isToday} from 'date-fns';
import {useFormik} from 'formik';
import React, {useCallback, useRef, useState} from 'react';
import {Text, TextInput, View} from 'react-native';

const strings = getI18nService().strings;

type RecordCollectionScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordCollection'>;
} & ModalWrapperFields;

const RecordCollectionScreen = withModal(
  ({route, openModal}: RecordCollectionScreenProps) => {
    const {customer, goBack} = route.params;
    const navigation = useAppNavigation();
    const {saveTransaction} = useTransaction();

    const [isLoading, setIsLoading] = useState(false);

    const handleSaveCollection = useCallback(
      async (payload) => {
        try {
          setIsLoading(true);
          const transaction = await saveTransaction({
            customer,
            ...payload,
            credit_amount: 0,
            is_collection: true,
            total_amount: payload.amount_paid,
          });
          setIsLoading(false);
          navigation.navigate('TransactionSuccess', {
            transaction,
            onDone: goBack,
          });
        } catch (error) {
          setIsLoading(false);
          handleError(error);
        }
      },
      [goBack, navigation, customer, saveTransaction],
    );

    const handleOpenPhotoComingSoonModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['red-200']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {strings('collection.coming_soon_select_a_photo_')}
            </Text>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    }, [openModal]);

    const {handleSubmit, values, handleChange, setFieldValue} = useFormik({
      initialValues: {
        note: '',
        amount_paid: undefined,
        transaction_date: new Date(),
      },
      onSubmit: ({note, amount_paid, transaction_date}) => {
        handleSaveCollection({note, amount_paid, transaction_date});
      },
    });
    const noteFieldRef = useRef<TextInput | null>(null);
    return (
      <CalculatorView>
        <Page header={{iconLeft: {}, title: ' '}}>
          <TitleContainer
            title={strings('collection.header.title')}
            description={strings('collection.header.description')}
            containerStyle={applyStyles('mb-8')}
          />
          <CustomerListItem
            customer={customer}
            containerStyle={applyStyles('py-16 mb-16')}
          />
          <CalculatorInput
            placeholder="0.00"
            label={strings('collection.fields.amount.label')}
            value={values.amount_paid}
            containerStyle={applyStyles('mb-16')}
            onChangeText={(text) => {
              const value = toNumber(text);
              setFieldValue('amount_paid', value);
            }}
            autoFocus
            onEquals={() => {
              setImmediate(() => {
                if (noteFieldRef.current) {
                  noteFieldRef.current.focus();
                }
              });
            }}
          />
          <View style={applyStyles('py-12 flex-row items-center')}>
            <CircleWithIcon icon="edit-2" style={applyStyles('mr-12')} />
            <EditableInput
              multiline
              onChangeText={handleChange('note')}
              label={strings('collection.fields.note.placeholder')}
              labelStyle={applyStyles('text-400 text-base text-gray-300')}
              placeholder={strings('collection.fields.note.placeholder')}
              style={applyStyles('h-45', {
                width: dimensions.fullWidth - 68,
              })}
            />
          </View>

          <DatePicker
            //@ts-ignore
            minimumDate={new Date()}
            value={new Date(values.transaction_date)}
            onChange={(e: Event, date?: Date) =>
              !!date && setFieldValue('transaction_date', date)
            }>
            {(toggleShow) => (
              <TouchableActionItem
                icon="calendar"
                onPress={toggleShow}
                style={applyStyles('py-12 px-0')}
                leftSection={{
                  title: isToday(values.transaction_date)
                    ? strings('collection.today_text')
                    : format(values.transaction_date, 'MMM dd, yyyy'),
                  caption: strings('collection.transaction_date_text'),
                }}
              />
            )}
          </DatePicker>
          <TouchableActionItem
            icon="image"
            style={applyStyles('py-12 px-0 items-center')}
            leftSection={{
              title: strings('collection.select_a_photo_text'),
            }}
            onPress={handleOpenPhotoComingSoonModal}
          />
          <View
            style={applyStyles(
              `flex-row items-end ${
                values.amount_paid ? 'justify-between' : 'justify-end'
              }`,
            )}>
            {!!values.amount_paid && (
              <DatePicker
                value={new Date(values.transaction_date)}
                containerStyle={applyStyles({width: '48%'})}
                onChange={(e: Event, date?: Date) =>
                  !!date && setFieldValue('transaction_date', date)
                }>
                {(toggleShow) => {
                  return (
                    <>
                      <Text
                        style={applyStyles(
                          'text-sm text-500 text-gray-50 pb-8 flex-1',
                        )}>
                        {strings('date')}
                      </Text>
                      <Touchable onPress={toggleShow}>
                        <View
                          style={applyStyles(
                            'px-8 py-16 flex-row items-center',
                            {
                              borderWidth: 2,
                              borderRadius: 8,
                              borderColor: colors['gray-20'],
                            },
                          )}>
                          <Icon
                            size={16}
                            name="calendar"
                            type="feathericons"
                            color={colors['gray-50']}
                          />
                          <Text
                            style={applyStyles(
                              'pl-sm text-xs text-uppercase text-700 text-gray-300',
                            )}>
                            {format(
                              new Date(values.transaction_date),
                              'MMM dd, yyyy',
                            )}
                          </Text>
                        </View>
                      </Touchable>
                    </>
                  );
                }}
              </DatePicker>
            )}
          </View>
          <Button
            isLoading={isLoading}
            onPress={handleSubmit}
            title={strings('save')}
            style={applyStyles('mt-24')}
          />
        </Page>
      </CalculatorView>
    );
  },
);

export default RecordCollectionScreen;
