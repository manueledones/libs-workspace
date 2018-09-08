import { TestBed } from '@angular/core/testing';

import { NgLibraryService } from './ng-library.service';

describe('NgLibraryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgLibraryService = TestBed.get(NgLibraryService);
    expect(service).toBeTruthy();
  });
});
