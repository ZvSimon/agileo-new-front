import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './task-view.component.html',
})
export class TaskViewComponent implements OnInit {
  task: Task | null = null;
  today: string;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute
  ) {
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskService.getTaskById(id).subscribe(
        (task) => {
          this.task = task;
        },
        (error) => {
          console.error('Erreur lors du chargement de la tâche:', error);
        }
      );
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
} 