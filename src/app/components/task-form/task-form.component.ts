import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  addForm: FormGroup;
  today: string;

  constructor(private fb: FormBuilder, private taskService: TaskService, private router: Router, private location: Location) {
    this.addForm = this.fb.group({
      title: [''],
      description: [''],
      date: [''],
      status: ['à faire'],
    });
    this.today = new Date().toISOString();
  }

  private formatDateForInput(dateString: string): string {
    return dateString.split('T')[0];
  }

  onSubmit() {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;
      const newTask: Task = {
        ...formValue,
        date: new Date(formValue.date)
      };
      
      this.taskService.createTask(newTask).subscribe(
        (response) => {
          console.log('Tâche créée avec succès:', response);
          this.addForm.reset();
        },
        (error) => {
          console.error('Erreur lors de la création de la tâche:', error);
        }
      );
      this.router.navigate(['/']);
    }
  }

  // Fonction simple pour revenir en arrière
  goBack(): void {
    this.location.back();
  }
}