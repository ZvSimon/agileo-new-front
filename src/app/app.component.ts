import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeadingComponent } from './shared/heading/heading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeadingComponent],
  templateUrl: './app.component.html',
})
export class AppComponent  {
/*   tasks: any[] = [];

  ngOnInit() {
    this.loadTasks();
  }

  constructor(private http: HttpClient) {}

  loadTasks() {
    this.http.get<any[]>('http://localhost:8000/api/tasks').subscribe({
      next: (data) => (this.tasks = data),
      error: (err) => console.error('Erreur chargement tâches', err),
    });
  } */
}