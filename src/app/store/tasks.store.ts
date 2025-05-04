import { inject } from '@angular/core';
import { ViewModelReducer } from '../data/models/view-model-reducer.models';
import { Task } from '../data';
import { RequestState } from '../data/enum/request-state.enum';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import { TaskService } from '../repositories/services/task.service';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, tap} from 'rxjs';
import {concatLatestFrom, tapResponse} from '@ngrx/operators';
import {selectTasksList} from './tasks.selector';

type TaskStoreState = {
  tasks: ViewModelReducer<Task[]>;
};

const initialState: TaskStoreState = {
  tasks: {
    data: [],
    requestState: RequestState.Initial,
    errors: ''
  }
};

export const TasksStore = signalStore(
  withState(initialState),
  withMethods((store, taskService = inject(TaskService)) => {

    const setLoadState = (): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: RequestState.Loading,
          errors: ''
        }
      });
    };

      const handleLoadSuccess = (data: Task[]): void => {
        patchState(store, {
          tasks: {
            data,
            requestState: RequestState.Success,
            errors: ''
          }
        });
      };

      const handleLoadError = (error: Error): void => {
        patchState(store, {
          tasks: {
            ...store.tasks(),
            requestState: RequestState.Error,
            errors: error.message
          }
        });
      };
      return {
        loadTasks : rxMethod<void>(
          pipe(
            tap(()=>setLoadState()),
            concatLatestFrom(()=>{
              return taskService.getTasks().pipe(
                tapResponse({
                  next:handleLoadSuccess,
                  error:handleLoadError,
                })
              );
            }),
          )
        )
      }
  }),
  withComputed(store=>({
    selectTasksList : selectTasksList(store.tasks)
  }))
);
