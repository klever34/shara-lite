import {Button, DatePicker, Text, toNumber} from '@/components';
import {CalculatorInput, CalculatorView} from '@/components/CalculatorView';
import {CircleWithIcon} from '@/components/CircleWithIcon';
import {CustomerListItem} from '@/components/CustomerListItem';
import {EditableInput} from '@/components/EditableInput';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {MainStackParamList} from '@/screens/main';
import {getAnalyticsService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors, dimensions} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format, isToday} from 'date-fns';
import {useFormik} from 'formik';
import React, {useCallback, useRef, useState} from 'react';
import {TextInput, View} from 'react-native';

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
        console.log(payload);
        
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
      getAnalyticsService().logEvent('comingSoonPrompted', {
        feature: 'record_collection_select_photo',
      });
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['green-100']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {strings('collection.coming_soon_select_a_photo')}
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
              console.log(text);
              
              const value = toNumber(text);
              console.log(value);
              
              setFieldValue('amount_paid', value);
            }}
            autoFocus
          />
          <View style={applyStyles('py-12 flex-row items-center')}>
            <CircleWithIcon icon="edit-2" style={applyStyles('mr-12')} />
            <EditableInput
              multiline
              ref={noteFieldRef}
              value={values.note}
              onChangeText={handleChange('note')}
              label={strings('collection.fields.note.placeholder')}
              labelStyle={applyStyles('text-400 text-lg text-gray-300')}
              placeholder={strings('collection.fields.note.placeholder')}
              style={applyStyles({height: 45})}
              contentStyle={applyStyles({
                width: dimensions.fullWidth - 68,
              })}
            />
          </View>

          <DatePicker
            //@ts-ignore
            maximumDate={new Date()}
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
                  caption: isToday(values.transaction_date)
                    ? strings('collection.today_text')
                    : format(values.transaction_date, 'MMM dd, yyyy'),
                  title: strings('collection.transaction_date_text'),
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
