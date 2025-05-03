import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Task } from '../../data/models/task.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/tasks';

  public getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(shareReplay(1));
  }

  public getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  public createTask(Task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, Task);
  }

  public updateTask(Task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${Task.id}`, Task);
  }

  public deleteTask(id: string): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/${id}`);
  }
}
