import { describe, it, expect, afterEach, onTestFinished } from 'vitest';
import { allowA11y, skipA11yScan } from '@digitransit-ui/test-utils';

describe('toHaveNoA11yViolations', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('passes accessible markup', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await expect(document.body).toHaveNoA11yViolations();
  });

  it('reports violations with the rule and the offending node', async () => {
    document.body.innerHTML = '<button type="button"></button>';
    await expect(
      expect(document.body).toHaveNoA11yViolations(),
    ).rejects.toThrow(/button-name.*\n\s+.*<button/);
  });

  it('runs best-practice rules', async () => {
    document.body.innerHTML = '<div role="dialog">x</div>';
    await expect(
      expect(document.body).toHaveNoA11yViolations(),
    ).rejects.toThrow(/aria-dialog-name/);
  });

  it('skips violations matched by an allow entry', async () => {
    document.body.innerHTML =
      '<div id="legacy"><button type="button"></button></div>';
    await expect(document.body).toHaveNoA11yViolations({
      allow: [
        { rule: 'button-name', selector: '#legacy', reason: 'known issue' },
      ],
    });
  });

  it('does not let a selector-scoped entry hide other nodes', async () => {
    document.body.innerHTML = '<button id="other" type="button"></button>';
    await expect(
      expect(document.body).toHaveNoA11yViolations({
        allow: [
          { rule: 'button-name', selector: '#legacy', reason: 'known issue' },
        ],
      }),
    ).rejects.toThrow(/button-name/);
  });

  it('scopes allow entries across shadow roots', async () => {
    document.body.innerHTML = '<div id="legacy"><span id="host"></span></div>';
    const shadow = document
      .getElementById('host')
      .attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button type="button"></button>';
    await expect(document.body).toHaveNoA11yViolations({
      allow: [
        { rule: 'button-name', selector: '#legacy', reason: 'known issue' },
      ],
    });
  });

  it('queues overlapping runs', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await Promise.all([
      expect(document.body).toHaveNoA11yViolations(),
      expect(document.body).toHaveNoA11yViolations(),
    ]);
  });

  it('fails on allow entries that match nothing', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await expect(
      expect(document.body).toHaveNoA11yViolations({
        allow: [{ rule: 'button-name', reason: 'fixed already' }],
      }),
    ).rejects.toThrow(/Unused a11y allow entry: button-name/);
  });

  it('requires a reason for every allow entry', async () => {
    await expect(
      expect(document.body).toHaveNoA11yViolations({
        allow: [{ rule: 'button-name' }],
      }),
    ).rejects.toThrow(/needs a rule and a reason/);
  });

  it('rejects unknown rule ids', async () => {
    await expect(
      expect(document.body).toHaveNoA11yViolations({
        allow: [{ rule: 'buton-name', reason: 'typo' }],
      }),
    ).rejects.toThrow(/Unknown axe rule in a11y allow entry: buton-name/);
  });

  it('does not support .not', async () => {
    await expect(
      expect(document.body).not.toHaveNoA11yViolations(),
    ).rejects.toThrow(/not supported/);
  });

  // The matcher fails the test when it is not awaited.
  it.fails('must be awaited', () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    expect(document.body).toHaveNoA11yViolations();
  });
});

describe('automatic scan', () => {
  // Cleared after the scan, which runs in afterEach.
  const render = html => {
    document.body.innerHTML = html;
    onTestFinished(() => {
      document.body.innerHTML = '';
    });
  };

  it.fails('fails a test that leaves violations behind', () => {
    render('<button type="button"></button>');
  });

  it('ignores list items without their list', () => {
    render('<li>Item</li><div role="listitem">Item</div>');
  });

  it.fails('checks the parents of other roles', () => {
    render('<div role="tab">Tab</div>');
  });

  it('skips violations matched by allowA11y', () => {
    render('<button type="button"></button>');
    allowA11y([{ rule: 'button-name', reason: 'known issue' }]);
  });

  it.fails('fails on allowA11y entries that match nothing', () => {
    render('<button type="button">Go</button>');
    allowA11y([{ rule: 'button-name', reason: 'fixed already' }]);
  });

  it('skips tests that call skipA11yScan', () => {
    render('<button type="button"></button>');
    skipA11yScan('markup under test');
  });

  it('requires a reason for skipA11yScan', () => {
    expect(() => skipA11yScan()).toThrow(/needs a reason/);
  });

  it('skips tests that ran the full check', async () => {
    render('<button type="button"></button>');
    await expect(document.body).toHaveNoA11yViolations({
      allow: [{ rule: 'button-name', reason: 'known issue' }],
    });
  });
});
