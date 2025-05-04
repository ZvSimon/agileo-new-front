import { Task } from '../data';
import { ViewModelReducer } from '../data/models/view-model-reducer.models';
import { computed, Signal } from '@angular/core';
import { ViewModelSelector } from '../data/models/view-model-selector.models';
import { RequestState } from '../data/enum/request-state.enum';

export const selectTasksList = (
  loadTasksList: Signal<ViewModelReducer<Task[], 'multiple'>>
): Signal<ViewModelSelector<Task[], 'multiple'>> =>
  computed(() => {
    return {
      data: loadTasksList().data,
      errors: loadTasksList().errors,
      hasError: {
        load: loadTasksList().requestState['load'] === RequestState.Error,
        edit: loadTasksList().requestState['edit'] === RequestState.Error,
        add: loadTasksList().requestState['add'] === RequestState.Error,
        delete: loadTasksList().requestState['delete'] === RequestState.Error,
      },
      isPending: {
        load: loadTasksList().requestState['load'] === RequestState.Loading,
        edit: loadTasksList().requestState['edit'] === RequestState.Loading,
        add: loadTasksList().requestState['add'] === RequestState.Loading,
        delete: loadTasksList().requestState['delete'] === RequestState.Loading,
      },
    };
  });
