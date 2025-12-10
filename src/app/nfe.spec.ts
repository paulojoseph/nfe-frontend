import { TestBed } from '@angular/core/testing';

import { Nfe } from './nfe';

describe('Nfe', () => {
  let service: Nfe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Nfe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
