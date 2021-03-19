import {Button} from '@/components';
import {ToastContext} from '@/components/Toast';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import omit from 'lodash/omit';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Text} from '@/components';
import {Alert, FlatList, View} from 'react-native';
import {DisbursementProvider} from 'types/app';
//@ts-ignore
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {Page} from '@/components/Page';
import {getI18nService} from '@/services';
import Emblem from '@/assets/images/emblem-gray.svg';
import {DisbursementForm} from './DisbursementForm';
import {DisbursementOption} from '@/models/DisbursementMethod';
import {handleError} from '@/services/error-boundary';
import {useDisbursementMethod} from '@/services/disbursement-method';
import {parseISO} from 'date-fns';
const strings = getI18nService().strings;

function DisburementScreen(props: ModalWrapperFields) {
  const {openModal} = props;
  const apiService = getApiService();
  const navigation = useAppNavigation();
  const {
    getDisbursementMethods,
    saveDisbursementMethod,
  } = useDisbursementMethod();
  const disbursementMethods = getDisbursementMethods();
  const [disbursementProviders, setDisbursementProviders] = useState<
    DisbursementProvider[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(getAuthService().getUser());
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const {showSuccessToast} = useContext(ToastContext);

  const onFormSubmit = useCallback(
    async (values: DisbursementOption) => {
      //@ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {fieldsData, ...rest} = values;
      const updatedValues = {
        ...rest,
        fields: values?.fieldsData?.map((data) => omit(data, 'options')),
      };

      if (
        values?.fieldsData
          ?.filter((item) => item.required)
          .every((item) => item.value)
      ) {
        setIsSaving(true);
        try {
          const {data} = await apiService.saveDisbursementMethod(updatedValues);
          const {disbursementMethod} = data;
          await saveDisbursementMethod({
            disbursementMethod: {
              ...disbursementMethod,
              created_at: parseISO(disbursementMethod.created_at),
              updated_at: parseISO(disbursementMethod.updated_at),
            },
          });
          showSuccessToast(strings('payment.payment_container.payment_added'));
          setIsSaving(false);
        } catch (error) {
          handleError(error);
        }
      } else {
        Alert.alert(
          strings('warning'),
          strings('payment.payment_container.warning_message'),
        );
      }
    },
    [apiService, saveDisbursementMethod, showSuccessToast],
  );

  const handleOpenAddItemModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <KeyboardAwareScrollView
          nestedScrollEnabled
          persistentScrollbar={true}
          keyboardShouldPersistTaps="always">
          <Text
            style={applyStyles(
              'text-center text-uppercase text-700 text-gray-300 mb-16 mt-10',
            )}>
            {strings('payment.withdrawal_method.add_withdrawal_method')}
          </Text>
          <DisbursementForm
            onFormSubmit={onFormSubmit}
            disbursementProviders={disbursementProviders}
            renderButtons={(handleSubmit) => (
              <>
                <View style={applyStyles('px-2 py-14')}>
                  <View
                    style={applyStyles(
                      'pt-10 flex-row items-center justify-between',
                    )}>
                    <Button
                      title={strings('cancel')}
                      onPress={closeModal}
                      variantColor="transparent"
                      style={applyStyles({width: '48%'})}
                    />
                    <Button
                      title={strings('save')}
                      isLoading={isSaving}
                      style={applyStyles({width: '48%'})}
                      onPress={() => {
                        handleSubmit();
                        closeModal();
                      }}
                    />
                  </View>
                </View>
              </>
            )}
          />
        </KeyboardAwareScrollView>
      ),
    });
  }, [openModal, isSaving, onFormSubmit, disbursementProviders]);

  const fectchDisbursementProviders = useCallback(async () => {
    try {
      const country_code = business.country_code || user?.country_code;
      const providers = await apiService.getDisbursementProviders({
        country_code,
      });
      setDisbursementProviders(providers);
    } catch (error) {
      setDisbursementProviders([]);
    }
  }, [apiService, business, user]);

  const handleGoBack = useCallback(() => {
    const userData = getAuthService().getUser();
    if (userData?.is_identity_verified) {
      navigation.navigate('MoreTab');
    } else {
      navigation.goBack();
    }
  }, [navigation]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      setBusiness(getAuthService().getBusinessInfo());
      setUser(getAuthService().getUser());
    });
  }, [navigation]);

  useEffect(() => {
    fectchDisbursementProviders();
  }, [fectchDisbursementProviders]);

  return (
    <Page
      header={{
        title: strings('payment.payment_container.payment_settings'),
        style: applyStyles('py-8'),
        iconLeft: {onPress: handleGoBack},
      }}
      style={applyStyles('px-0')}>
      <KeyboardAwareScrollView
        nestedScrollEnabled
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        style={applyStyles('py-18 bg-white flex-1')}>
        {disbursementMethods.length === 0 ? (
          <View style={applyStyles('flex-1')}>
            <View style={applyStyles('center pb-32')}>
              <Emblem width={64} height={64} />
              <Text
                style={applyStyles(
                  'text-center text-gray-200 text-base pt-16 px-24',
                )}>
                {strings(
                  'payment.withdrawal_method.withdrawal_method_description',
                )}
              </Text>
            </View>
            <DisbursementForm
              onFormSubmit={(values) =>
                onFormSubmit({...values, is_primary: true})
              }
              disbursementProviders={disbursementProviders}
              renderButtons={(handleSubmit, values) => (
                <View style={applyStyles('pt-24', {paddingBottom: 300})}>
                  <Button
                    title={strings('save')}
                    isLoading={isSaving}
                    onPress={handleSubmit}
                    disabled={!values?.slug}
                  />
                </View>
              )}
            />
          </View>
        ) : (
          <View style={applyStyles('flex-1')}>
            <Text
              style={applyStyles('text-center text-gray-200 text-sm px-12')}>
              {strings('payment.withdrawal_method.withdrawal_method_list')}
            </Text>

            <View style={applyStyles('p-16')}>
              <Button
                title={strings(
                  'payment.withdrawal_method.add_withdrawal_method',
                )}
                onPress={handleOpenAddItemModal}
              />
            </View>
            <FlatList
              data={disbursementMethods}
              style={applyStyles('pb-56')}
              renderItem={({item}) => {
                return (
                  <View
                    style={applyStyles(
                      'flex-row items-center py-8 px-16 bg-white justify-between',
                      {
                        borderTopColor: colors['gray-10'],
                        borderTopWidth: 1,
                        borderBottomColor: colors['gray-10'],
                        borderBottomWidth: 1,
                      },
                    )}>
                    <View style={applyStyles('py-8')}>
                      {item.parsedAccountDetails?.fields?.map((i: any) =>
                        i.type === 'dropdown' ? (
                          <Text
                            key={i.key}
                            style={applyStyles(
                              'pb-2 text-gray-300 text-700 text-base',
                            )}>
                            {i.label} - {JSON.parse(i.value).label}
                          </Text>
                        ) : (
                          <Text
                            key={i.key}
                            style={applyStyles(
                              'pb-2 text-gray-300 text-700 text-base',
                            )}>
                            {i.label} - {i.value}
                          </Text>
                        ),
                      )}
                    </View>
                  </View>
                );
              }}
              keyExtractor={(item, index) => `${item}-${index}`}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    </Page>
  );
}

export default withModal(DisburementScreen);
