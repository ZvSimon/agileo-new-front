export interface Task {
    id?: string;
    title: string;
    description: string;
    date: string;
    status: 'à faire' | 'en cours' | 'réalisée';
  }  