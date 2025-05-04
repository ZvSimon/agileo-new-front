import { Task } from '../data';
import { ViewModelReducer } from '../data/models/view-model-reducer.models';
import { computed, Signal } from '@angular/core';
import { ViewModelSelector } from '../data/models/view-model-selector.models';
import { RequestState } from '../data/enum/request-state.enum';

export const selectTasksList = (
  loadTasksList: Signal<ViewModelReducer<Task[], 'multiple'>>
): Signal<ViewModelSelector<Task[], 'multiple'>> =>
  computed(() => {
    const state = loadTasksList();

    return {
      data: state.data,
      errors: state.errors,
      hasError: state.requestState.load === RequestState.Error,
      isPending: state.requestState.load === RequestState.Loading
    };
  });
