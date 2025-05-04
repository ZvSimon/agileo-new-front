import { inject } from '@angular/core';
import { ViewModelReducer } from '../data/models/view-model-reducer.models';
import { Task } from '../data';
import { RequestState } from '../data/enum/request-state.enum';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { TaskService } from '../repositories/services/task.service';
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
      add: RequestState.Initial,
      delete: RequestState.Initial,
    },
    errors: '',
  },
};

export const TasksStore = signalStore(
  withState(initialState),
  withMethods((store, taskService = inject(TaskService)) => {
    const setLoadingState = (method: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            [method]: RequestState.Loading,
          },
        },
      });
    };

    const handleLoadSuccess = (data: Task[]): void => {
      patchState(store, {
        tasks: {
          data,
          requestState: {
            ...store.tasks().requestState,
            load: RequestState.Success,
          },
          errors: '',
        },
      });
    };

    const handleLoadError = (error: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            load: RequestState.Error,
          },
          errors: error,
        },
      });
    };

    const handleAddSuccess = (task: Task): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          data: [...store.tasks().data, task],
          requestState: {
            ...store.tasks().requestState,
            add: RequestState.Success,
          },
          errors: '',
        },
      });
    };

    const handleAddError = (error: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            add: RequestState.Error,
          },
          errors: error,
        },
      });
    };

    const handleEditSuccess = (task: Task): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          data: store.tasks().data.map((t) => (t.id === task.id ? task : t)),
          requestState: {
            ...store.tasks().requestState,
            edit: RequestState.Success,
          },
          errors: '',
        },
      });
    };

    const handleEditError = (error: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            edit: RequestState.Error,
          },
          errors: error,
        },
      });
    };

    const handleDeleteSuccess = (taskId: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          data: store.tasks().data.filter((t) => t.id !== taskId),
          requestState: {
            ...store.tasks().requestState,
            delete: RequestState.Success,
          },
          errors: '',
        },
      });
    };

    const handleDeleteError = (error: string): void => {
      patchState(store, {
        tasks: {
          ...store.tasks(),
          requestState: {
            ...store.tasks().requestState,
            delete: RequestState.Error,
          },
          errors: error,
        },
      });
    };

    return {
      loadTasks: () => {
        tap(() => setLoadingState('load')),
          taskService.getTasks().pipe(
            tapResponse({
              next: handleLoadSuccess,
              error: handleLoadError,
            })
          );
      },

      addTasks: (task: Task) => {
        tap(() => setLoadingState('add')),
          taskService.createTask(task).pipe(
            tapResponse({
              next: handleAddSuccess,
              error: handleAddError,
            })
          );
      },

      editTasks: (task: Task, taskId: string) => {
        tap(() => setLoadingState('edit')),
          taskService.updateTask(task, taskId).pipe(
            tapResponse({
              next: handleEditSuccess,
              error: handleEditError,
            })
          );
      },

      deleteTasks: (taskId: string) => {
        tap(() => setLoadingState('delete')),
          taskService.deleteTask(taskId).pipe(
            tapResponse({
              next: () => handleDeleteSuccess(taskId),
              error: handleDeleteError,
            })
          );
      },
    };
  }),
  withComputed((store) => ({
    selectTasksList: selectTasksList(store.tasks),
  }))
);
