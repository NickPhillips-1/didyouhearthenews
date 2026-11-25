import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateStoryRequest, Story, StorySummary } from './models';

/** Thin wrapper over the backend API. Components depend on this, not HttpClient. */
@Injectable({ providedIn: 'root' })
export class StoryApiService {
  private readonly base = '/api/stories';

  constructor(private http: HttpClient) {}

  list(): Observable<StorySummary[]> {
    return this.http.get<StorySummary[]>(this.base);
  }

  get(id: number): Observable<Story> {
    return this.http.get<Story>(`${this.base}/${id}`);
  }

  create(request: CreateStoryRequest): Observable<Story> {
    return this.http.post<Story>(this.base, request);
  }
}
