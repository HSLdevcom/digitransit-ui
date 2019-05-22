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

      // overwrite matching sections
      expect(merged.aboutThisService.fi[0].header).to.equal('header1');
      expect(merged.aboutThisService.fi[0].paragraphs[0]).to.equal('bar1');
      expect(merged.aboutThisService.fi[0].link).to.equal('bar1.com');

      // keep sections which do not exist in sub config
      expect(merged.aboutThisService.fi[1].header).to.equal('header2');
      expect(merged.aboutThisService.fi[1].paragraphs[0]).to.equal('foo2');
      expect(merged.aboutThisService.fi[1].link).to.equal('bar2.com');

      // insert new sections
      expect(merged.aboutThisService.fi[2].header).to.equal('header3');
      expect(merged.aboutThisService.fi[2].paragraphs[0]).to.equal('bar3');
      expect(merged.aboutThisService.fi[2].link).to.equal('bar3.com');
    });
  });
});
