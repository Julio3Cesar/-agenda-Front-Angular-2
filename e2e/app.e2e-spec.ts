import { AgendaAngularPage } from './app.po';

describe('agenda-angular App', () => {
  let page: AgendaAngularPage;

  beforeEach(() => {
    page = new AgendaAngularPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
