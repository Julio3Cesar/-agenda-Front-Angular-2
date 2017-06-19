import { TestBed, inject } from '@angular/core/testing';

import { MenuUserService } from './menu-user.service';

describe('MenuUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuUserService]
    });
  });

  it('should be created', inject([MenuUserService], (service: MenuUserService) => {
    expect(service).toBeTruthy();
  }));
});
