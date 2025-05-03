import {Task} from '../data';
import {ViewModelReducer} from '../data/models/view-model-reducer.models';
import {computed, Signal} from '@angular/core';
import {ViewModelSelector} from '../data/models/view-model-selector.models';
import {RequestState} from '../data/enum/request-state.enum';

export const selectTasksList = (
  loadTasksList: Signal<ViewModelReducer<Task[]>>
): Signal<ViewModelSelector<Task[]>> =>
  computed(() => ({
    data: loadTasksList().data,
    errors: loadTasksList().errors,
    hasError: loadTasksList().requestState === RequestState.Error,
    isPending: loadTasksList().requestState === RequestState.Loading
  }));
