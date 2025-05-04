import {inject, Injectable} from '@angular/core';
import {TasksStore} from '../store/tasks.store';

@Injectable({
  providedIn: 'root'
})

export class TasksFacade {
  private readonly store = inject(TasksStore);

  public readonly selectTasksList = this.store.selectTasksList;

  public loadTasks():void{
    this.store.loadTasks();
  }
}
