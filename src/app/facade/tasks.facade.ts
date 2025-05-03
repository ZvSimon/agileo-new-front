import {inject, Injectable} from '@angular/core';
import {TaskStore} from '../store/task.store';

@Injectable({
  providedIn: 'root'
})

export class TasksFacade {
  private readonly store = inject(TaskStore);

  public readonly selectTasksList = this.store.selectTasksList;

  public loadTasks():void{
    this.store.loadTasks();
  }
}
