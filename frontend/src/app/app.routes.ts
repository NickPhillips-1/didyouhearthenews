import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StoryComponent } from './pages/story/story.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'stories/:id', component: StoryComponent },
  { path: '**', redirectTo: '' }
];
