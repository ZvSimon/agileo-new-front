import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../repositories/services/task.service';
import { Task } from '../../data/models/task.model';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location, DatePipe } from '@angular/common';

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateTaskComponent implements OnChanges, OnInit {
  public task = signal<Task | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly datePipe = inject(DatePipe);
  public readonly id = input.required<string>();
  @Output() taskUpdated = new EventEmitter<void>();
  updateForm: FormGroup;
  today: string;

  constructor() {
    this.updateForm = this.fb.group({
      title: [''],
      description: [''],
      date: [''],
      status: [''],
    });
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    this.taskService.getTaskById(this.id()).subscribe();
  }

  private formatDateForInput(dateString: string): string {
    // Utiliser DatePipe pour formater la date au format YYYY-MM-DD
    return this.datePipe.transform(dateString, 'yyyy-MM-dd') || '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      const currentTask = this.task();
      if (currentTask) {
        const formattedDate = this.formatDateForInput(currentTask.date);
        this.updateForm.patchValue({
          ...this.task,
          date: formattedDate,
        });
      }
    }
  }

  onSubmit() {
    if (this.task) {
      const formValue = this.updateForm.value;

      // Convertir la date en objet Date et définir l'heure à 23:59:00.000
      const selectedDate = new Date(formValue.date);
      selectedDate.setHours(23, 59, 0, 0);

      // Formater la date en ISO avec fuseau horaire
      const formattedDate = this.datePipe.transform(
        selectedDate,
        'yyyy-MM-ddTHH:mm:ss.SSSZ'
      );

      console.log("Date saisie par l'utilisateur:", formValue.date);
      console.log('Date ajustée à 23h59:', selectedDate);
      console.log('Date formatée avec DatePipe:', formattedDate);

      const updatedTask = {
        ...this.task,
        ...formValue,
        date: formattedDate || formValue.date,
      };

      this.taskService.updateTask(updatedTask, this.id()).subscribe(
        (response) => {
          console.log('Tâche mise à jour avec succès:', response);
          const displayDate = this.datePipe.transform(
            response.date,
            'dd/MM/yyyy'
          );
          console.log('Date après mise à jour (formatée):', displayDate);
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
