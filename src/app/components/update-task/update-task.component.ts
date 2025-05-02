import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
})
export class UpdateTaskComponent implements OnChanges, OnInit {
  @Input() task: Task | null = null;
  @Output() taskUpdated = new EventEmitter<void>();
  updateForm: FormGroup;
  today: string;

  constructor(private fb: FormBuilder, private taskService: TaskService, private router: Router, private route: ActivatedRoute, private location: Location) {
    this.updateForm = this.fb.group({
      title: [''],
      description: [''],
      date: [''],
      status: [''],
    });
    this.today = new Date().toUTCString().substring(0, 10);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskService.getTaskById(id).subscribe(task => {
        if (task) {
          this.task = task;
          const formattedDate = this.formatDateForInput(task.date);
          this.updateForm.patchValue({ 
            ...task,
            date: formattedDate
          });
        }
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    // Parse the date string as-is without adjusting for the local timezone
    const date = new Date(dateString);
    // Format the date as YYYY-MM-DD for the input field
    return date.toISOString().split('T')[0];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && this.task) {
      const formattedDate = this.formatDateForInput(this.task.date);
      this.updateForm.patchValue({ 
        ...this.task,
        date: formattedDate
      });
    }
  }

  onSubmit() {
    if (this.task) {
      const formValue = this.updateForm.value;
      // Parse the local date and adjust it to UTC
      const localDate = new Date(formValue.date);
      const updatedTask = { 
        ...this.task, 
        ...formValue,
        date: localDate.toISOString() // Save as UTC
      };
      this.taskService.updateTask(updatedTask).subscribe(
        (response) => {
          console.log('Tâche mise à jour avec succès:', response);
          this.taskUpdated.emit();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la tâche:', error);
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