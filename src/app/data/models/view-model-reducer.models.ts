import {RequestState} from '../enum/request-state.enum';

type RequestStateType = void | 'multiple';

export interface ViewModelReducer<T,R extends RequestStateType = void>{
  data : T;
  requestState: R extends 'multiple' ? Record<string,RequestState> : RequestState;
  errors:string;
}
