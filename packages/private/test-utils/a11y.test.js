import { describe, it, expect, afterEach } from 'vitest';
import { expectNoA11yViolations } from './a11y';

describe('expectNoA11yViolations', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('passes accessible markup', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await expectNoA11yViolations();
  });

  it('reports violations with the rule and the offending node', async () => {
    document.body.innerHTML = '<button type="button"></button>';
    await expect(expectNoA11yViolations()).rejects.toThrow(
      /button-name.*\n\s+.*<button/,
    );
  });

  it('skips violations matched by an allow entry', async () => {
    document.body.innerHTML =
      '<div id="legacy"><button type="button"></button></div>';
    await expectNoA11yViolations(document.body, {
      allow: [
        { rule: 'button-name', selector: '#legacy', reason: 'known issue' },
      ],
    });
  });

  it('does not let a selector-scoped entry hide other nodes', async () => {
    document.body.innerHTML = '<button id="other" type="button"></button>';
    await expect(
      expectNoA11yViolations(document.body, {
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
    await expectNoA11yViolations(document.body, {
      allow: [
        { rule: 'button-name', selector: '#legacy', reason: 'known issue' },
      ],
    });
  });

  it('queues overlapping runs', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await Promise.all([expectNoA11yViolations(), expectNoA11yViolations()]);
  });

  it('rejects unknown rule ids', async () => {
    await expect(
      expectNoA11yViolations(document.body, {
        allow: [{ rule: 'buton-name', reason: 'typo' }],
      }),
    ).rejects.toThrow(/Unknown axe rule in a11y allow entry: buton-name/);
  });

  it('fails on allow entries that match nothing', async () => {
    document.body.innerHTML = '<button type="button">Go</button>';
    await expect(
      expectNoA11yViolations(document.body, {
        allow: [{ rule: 'button-name', reason: 'fixed already' }],
      }),
    ).rejects.toThrow(/Unused a11y allow entry: button-name/);
  });

  it('requires a reason for every allow entry', async () => {
    await expect(
      expectNoA11yViolations(document.body, {
        allow: [{ rule: 'button-name' }],
      }),
    ).rejects.toThrow(/needs a rule and a reason/);
  });
});
