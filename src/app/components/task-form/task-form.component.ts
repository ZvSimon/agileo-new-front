import { Component } from '@angular/core';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../repositories/services/task.service';
import { RouterModule, Router } from '@angular/router';
import { Task } from '../../data';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.component.html',
  providers: [DatePipe]
})
export class TaskFormComponent {
  addForm: FormGroup;
  today: string;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private location: Location,
    private datePipe: DatePipe
  ) {
    this.addForm = this.fb.group({
      title: [''],
      description: [''],
      date: [''],
      status: ['à faire'],
    });
    // Utiliser DatePipe pour obtenir la date du jour au format YYYY-MM-DD
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  private formatDateForInput(dateString: string): string {
    // Utiliser DatePipe pour formater la date au format YYYY-MM-DD
    return this.datePipe.transform(dateString, 'yyyy-MM-dd') || '';
  }

  onSubmit() {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;

      // Convertir la date en objet Date et définir l'heure à 23:59
      const selectedDate = new Date(formValue.date);
      selectedDate.setHours(23, 59, 0, 0); // Heure = 23:59:00.000

      // Formater la date en ISO avec fuseau horaire
      const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-ddTHH:mm:ss.SSSZ');

      console.log('Date saisie par l\'utilisateur:', formValue.date);
      console.log('Date ajustée à 23h59:', selectedDate);
      console.log('Date formatée avec DatePipe:', formattedDate);

      const newTask: Task = {
        ...formValue,
        date: formattedDate || formValue.date
      };

      this.taskService.createTask(newTask).subscribe(
        (response) => {
          console.log('Tâche créée avec succès:', response);
          const displayDate = this.datePipe.transform(response.date, 'dd/MM/yyyy');
          console.log('Date après création (formatée):', displayDate);
          this.addForm.reset();
        },
        (error) => {
          console.error('Erreur lors de la création de la tâche:', error);
        }
      );

      this.router.navigate(['/']);
    }
  }

}
