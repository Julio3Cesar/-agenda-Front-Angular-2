import { TestBed, inject } from '@angular/core/testing';

import { ContatosService } from './contatos.service';

describe('ContatosService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContatosService]
    });
  });

  it('should be created', inject([ContatosService], (service: ContatosService) => {
    expect(service).toBeTruthy();
  }));
});
