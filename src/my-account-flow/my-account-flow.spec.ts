import { SpecPage, newSpecPage } from '@stencil/core/testing';
import { MyAccountFlow } from './my-account-flow';

describe('my-account-flow', () => {
  let page: SpecPage;
  let el: HTMLElement;

  it('should build', () => {
    expect(new MyAccountFlow()).toBeTruthy();
  });

  beforeEach(async () => {
    page = await newSpecPage({
      components: [MyAccountFlow]
    });
  });

  describe('actions', () => {
    it('should render a `my-account-flow`', async () => {
      await page.setContent('<my-account-flow></my-account-flow>');
      await page.waitForChanges();
      el = page.root.shadowRoot
        .querySelector('.my-account-flow');

      expect(el).toBeTruthy();
    });

    it('should trigger a `FlowStarted` event when component has loaded', async () => {
      const MyAccountFlow = new MyAccountFlow();
      const spy = jest.spyOn(MyAccountFlow.FlowStarted, 'emit');
      MyAccountFlow.componentDidLoad();
      expect(spy).toHaveBeenCalled();
    });

    it('should trigger a `FlowCompleted` event when close method is called', async () => {
      const MyAccountFlow = new MyAccountFlow();
      const spy = jest.spyOn(MyAccountFlow.FlowCompleted, 'emit');
      MyAccountFlow.close();
      expect(spy).toHaveBeenCalled();
    });
  });
});
