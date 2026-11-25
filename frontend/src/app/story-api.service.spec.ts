import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StoryApiService } from './story-api.service';

describe('StoryApiService', () => {
  let service: StoryApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StoryApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /api/stories for the list', () => {
    service.list().subscribe((stories) => expect(stories).toEqual([]));
    const req = http.expectOne('/api/stories');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('GET /api/stories/:id for one story', () => {
    service.get(4).subscribe((story) => expect(story.id).toBe(4));
    const req = http.expectOne('/api/stories/4');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 4 });
  });

  it('POST /api/stories to create', () => {
    const body = { title: 'City housing plan', urls: ['https://example.com/a'] };
    service.create(body).subscribe((story) => expect(story.id).toBe(9));
    const req = http.expectOne('/api/stories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 9 });
  });
});
