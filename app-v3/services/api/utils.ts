import {useCallback, useEffect, useMemo, useReducer} from 'react';

type AsyncState = {
  loading: boolean;
  response: any | null;
  error: any | null;
};

type AsyncAction = {
  type: 'REQUEST' | 'SUCCESS' | 'FAILURE' | 'RESET';
  payload?: any;
};

type AsyncOptions = {
  defer?: boolean;
};

type AsyncReducer = (state: AsyncState, action: AsyncAction) => AsyncState;

const asyncReducer: AsyncReducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST':
      return {...state, loading: true, error: null};
    case 'SUCCESS':
      return {loading: false, error: null, response: action.payload};
    case 'FAILURE':
      return {...state, loading: false, error: action.payload};
    case 'RESET':
      return {loading: false, error: null, response: null};
    default:
      return state;
  }
};

export const useAsync = <Response extends any, ErrorResponse extends any = any>(
  promiseFn: (...args: any[]) => Promise<Response>,
  {defer = false}: AsyncOptions = {},
) => {
  const [state, dispatch] = useReducer(asyncReducer, {
    loading: false,
    response: null,
    error: null,
  });
  const run = useCallback(
    (...args) => {
      dispatch({type: 'REQUEST'});
      return promiseFn(...args)
        .then((response) => {
          dispatch({type: 'SUCCESS', payload: response});
          return response;
        })
        .catch((error) => {
          dispatch({type: 'FAILURE', payload: error});
          return Promise.reject(error);
        });
    },
    [promiseFn],
  );
  const reset = useCallback(() => {
    dispatch({type: 'RESET'});
  }, []);
  useEffect(() => {
    if (!defer) {
      run().then();
    }
  }, [run, defer]);
  return useMemo(() => ({...state, run, reset}), [reset, run, state]);
};
