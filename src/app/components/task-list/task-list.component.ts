import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../repositories/services/task.service';
import { Observable, catchError, of, tap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Task } from '../../data';
import {TasksFacade} from '../../facade/tasks.facade';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TaskListComponent implements OnInit {
  tasks$!: Observable<Task[]>;
  selectedTask: Task | null = null;
  errorMessage = '';

  private readonly service = inject(TaskService);
  private readonly tasksFacade = inject(TasksFacade);
  public readonly tasksListViewModel = this.tasksFacade.selectTasksList;
  private readonly fb = inject(FormBuilder);
  public today = new Date().toISOString().split('T')[0];

  todoForm = this.fb.group({
    task: [''],
  });

  ngOnInit(): void {
    this.tasksFacade.loadTasks();
    console.log(this.tasksListViewModel().data);
  }

  addTodo(): void {
    const taskValue = this.todoForm.value.task;
    if (!taskValue) return;

    const newTodo: Task = {
      title: taskValue,
      description: '',
      date: new Date().toISOString(),
      status: 'à faire'
    };
    this.service.createTask(newTodo).subscribe({
      next: (createdTask) => {
        this.todoForm.reset();
        this.tasks$ = this.tasks$.pipe(
          tap(tasks => tasks.push(createdTask)) // Append the new task to the existing list
        );
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de la tâche';
        console.error('Erreur:', error);
      }
    });
  }

  updateTodo(task: Task): void {
    const updatedTodo = {
      ...task,
      status: task.status === 'à faire' ? 'en cours' as const :
              task.status === 'en cours' ? 'réalisée' as const : 'à faire' as const
    };
    this.service.updateTask(updatedTodo).subscribe({
      next: (updatedTask) => {
        this.tasks$ = this.tasks$.pipe(
          tap(tasks => {
            const index = tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
              tasks[index] = updatedTask; // Update the task in the list
            }
          })
        );
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour de la tâche';
        console.error('Erreur:', error);
      }
    });
  }

  deleteTodo(taskId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.service.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks$ = this.tasks$.pipe(
            tap(tasks => {
              const index = tasks.findIndex(t => t.id === taskId);
              if (index !== -1) {
                tasks.splice(index, 1); // Remove the task from the list
              }
            })
          );
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de la tâche';
          console.error('Erreur:', error);
        }
      });
    }
  }
}
