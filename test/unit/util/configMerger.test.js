import merger from '../../../app/util/configMerger';

describe('configMerger', () => {
  describe('About page content', () => {
    it('should combine sections array by headers', () => {
      const base = {
        aboutThisService: {
          fi: [
            {
              header: 'header1',
              paragraphs: ['foo1'],
              link: 'foo1.com',
            },
            {
              header: 'header2',
              paragraphs: ['foo2'],
            },
          ],
        },
      };

      const modifications = {
        aboutThisService: {
          fi: [
            {
              header: 'header1',
              paragraphs: ['bar1'],
              link: 'bar1.com',
            },
            {
              header: 'header2',
              link: 'bar2.com',
            },
            {
              header: 'header3',
              paragraphs: ['bar3'],
              link: 'bar3.com',
            },
          ],
        },
      };

      const merged = merger(base, modifications);

      expect(merged.aboutThisService.fi[0].header).toBe('header1');
      expect(merged.aboutThisService.fi[0].paragraphs[0]).toBe('bar1');
      expect(merged.aboutThisService.fi[0].link).toBe('bar1.com');

      expect(merged.aboutThisService.fi[1].header).toBe('header2');
      expect(merged.aboutThisService.fi[1].paragraphs[0]).toBe('foo2');
      expect(merged.aboutThisService.fi[1].link).toBe('bar2.com');

      expect(merged.aboutThisService.fi[2].header).toBe('header3');
      expect(merged.aboutThisService.fi[2].paragraphs[0]).toBe('bar3');
      expect(merged.aboutThisService.fi[2].link).toBe('bar3.com');
    });
  });
});
