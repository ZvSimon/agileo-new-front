import { inject } from '@angular/core';
import { ViewModelReducer } from '../data/models/view-model-reducer.models';
import { Task } from '../data';
import { RequestState } from '../data/enum/request-state.enum';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TaskService } from '../repositories/services/task.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { selectTasksList } from './tasks.selector';

type TaskStoreState = {
  tasks: ViewModelReducer<Task[], 'multiple'>;
};

const initialState: TaskStoreState = {
  tasks: {
    data: [],
    requestState: {
      load: RequestState.Initial,
      edit: RequestState.Initial,
      create: RequestState.Initial,
      delete: RequestState.Initial
    },
    errors: ''
  }
};

export const TasksStore = signalStore(
  withState(initialState),
  withMethods((store, taskService = inject(TaskService)) => {

    // Helper functions
    const setRequestState = (key: keyof typeof initialState.tasks.requestState, state: RequestState) => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            [key]: state
          },
          ...(state === RequestState.Loading ? { errors: '' } : {})
        }
      });
    };

    const setError = (key: keyof typeof initialState.tasks.requestState, error: unknown) => {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            [key]: RequestState.Error
          },
          errors: message
        }
      });
    };

    return {
      loadTasks: rxMethod<void>(
        pipe(
          tap(() => {
            setRequestState('load', RequestState.Loading);
            console.log('Loading tasks...');
          }),
          switchMap(() =>
            taskService.getTasks().pipe(
              tapResponse({
                next: (data) => {
                  console.log('Tasks loaded:', data);
                  patchState(store, {
                    tasks: {
                      data,
                      requestState: {
                        ...store.tasks().requestState,
                        load: RequestState.Success
                      },
                      errors: ''
                    }
                  });
                },
                error: (error) => {
                  console.error('Error loading tasks:', error);
                  setError('load', error);
                }
              })
            )
          )
        )
      ),

      createTask: rxMethod<Task>(
        pipe(
          tap(() => setRequestState('create', RequestState.Loading)),
          switchMap((task) =>
            taskService.createTask(task).pipe(
              tapResponse({
                next: (created) => {
                  patchState(store, {
                    tasks: {
                      ...store.tasks(),
                      data: [...store.tasks().data, created],
                      requestState: {
                        ...store.tasks().requestState,
                        create: RequestState.Success
                      },
                      errors: ''
                    }
                  });
                },
                error: (error) => setError('create', error)
              })
            )
          )
        )
      ),

      editTask: rxMethod<Task>(
        pipe(
          tap(() => setRequestState('edit', RequestState.Loading)),
          switchMap((task) =>
            taskService.editTask(task).pipe(
              tapResponse({
                next: (updated) => {
                  patchState(store, {
                    tasks: {
                      ...store.tasks(),
                      data: store.tasks().data.map(t =>
                        t.id === updated.id ? updated : t
                      ),
                      requestState: {
                        ...store.tasks().requestState,
                        edit: RequestState.Success
                      },
                      errors: ''
                    }
                  });
                },
                error: (error) => setError('edit', error)
              })
            )
          )
        )
      ),

      deleteTask: rxMethod<number>(
        pipe(
          tap(() => setRequestState('delete', RequestState.Loading)),
          switchMap((taskId) =>
            taskService.deleteTask(taskId).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    tasks: {
                      ...store.tasks(),
                      data: store.tasks().data.filter(t => t.id !== taskId),
                      requestState: {
                        ...store.tasks().requestState,
                        delete: RequestState.Success
                      },
                      errors: ''
                    }
                  });
                },
                error: (error) => setError('delete', error)
              })
            )
          )
        )
      )
    };
  }),
  withComputed(store => ({
    selectTasksList: selectTasksList(store.tasks)
  }))
);