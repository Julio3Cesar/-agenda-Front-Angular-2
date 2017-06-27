import { TestePage } from './app.po';

describe('teste App', () => {
  let page: TestePage;

  beforeEach(() => {
    page = new TestePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
