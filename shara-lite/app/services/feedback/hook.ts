import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IFeedback, modelName} from '@/models/Feedback';
import {getAnalyticsService} from '@/services';
import perf from '@react-native-firebase/perf';

interface saveFeedbackInterface {
  message: string;
}

interface useFeedbackInterface {
  saveFeedback: (data: saveFeedbackInterface) => Promise<IFeedback>;
}

export const useFeedback = (): useFeedbackInterface => {
  const realm = useRealm();

  const saveFeedback = async ({
    message,
  }: saveFeedbackInterface): Promise<IFeedback> => {
    const feedbackDetails: IFeedback = {
      message,
      ...getBaseModelValues(),
    };

    const trace = await perf().startTrace('saveFeedback');
    realm.write(() => {
      realm.create<IFeedback>(modelName, feedbackDetails, UpdateMode.Modified);
    });
    await trace.stop();

    getAnalyticsService()
      .logEvent('feedbackSaved', {})
      .then(() => {});

    return feedbackDetails;
  };

  return {
    saveFeedback,
  };
};
