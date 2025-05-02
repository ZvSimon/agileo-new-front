import { Component, Input, Output, EventEmitter, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { Observable, catchError, of, tap } from 'rxjs';
import { RouterModule } from '@angular/router';

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
  today: string;

  private readonly service = inject(TaskService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.today = new Date().toISOString().split('T')[0];
  }

  todoForm = this.fb.group({
    task: [''],
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.tasks$ = this.service.getTasks().pipe(
      catchError(error => {
        this.errorMessage = 'Erreur lors du chargement des tâches';
        console.error('Erreur:', error);
        return of([]);
      })
    );
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
    this.service.createTask(newTodo).subscribe(() => {
      this.todoForm.reset();
      this.loadTodos();
    });
  }

  updateTodo(task: Task): void {
    const updatedTodo = { 
      ...task, 
      status: task.status === 'à faire' ? 'en cours' as const : 
              task.status === 'en cours' ? 'réalisée' as const : 'à faire' as const
    };
    this.service.updateTask(updatedTodo).pipe(
      catchError(error => {
        this.errorMessage = 'Erreur lors de la mise à jour de la tâche';
        console.error('Erreur:', error);
        return of(null);
      })
    ).subscribe(() => this.loadTodos());
  }

  deleteTask(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.service.deleteTask(id).pipe(
        catchError(error => {
          this.errorMessage = 'Erreur lors de la suppression de la tâche';
          console.error('Erreur:', error);
          return of(null);
        })
      ).subscribe(() => {
        this.loadTodos();
      });
    }
  }

  toggleEmojiPicker(task: Task) {
    this.selectedTask = task;
  }

  onEmojiSelect(event: any, task: Task) {
    this.service.updateTask(task).pipe(
      catchError(error => {
        this.errorMessage = 'Erreur lors de la mise à jour de l\'émoji';
        console.error('Erreur:', error);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log('Émoji mis à jour avec succès:', response);
      }
    });
  }
}