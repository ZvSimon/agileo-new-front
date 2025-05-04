type isMultipleType = void | 'multiple';

export interface ViewModelSelector<T,U extends isMultipleType = void>{
  data : T;
  isPending : U extends 'multiple' ? Record<string,boolean>:boolean;
  hasError : U extends 'multiple' ? Record<string,boolean>:boolean;
  errors:string;
}
