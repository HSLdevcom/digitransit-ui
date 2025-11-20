/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import {
  typeOfComponent,
  getChildByType,
  getChildrenByType,
  groupChildrenByType,
} from '../../../app/util/reactUtils';

const Header = ({ children, ...props }) => (
  <header {...props}>{children}</header>
);
Header.displayName = 'Header';

const Content = () => <main>Content</main>;
Content.displayName = 'Content';

const TypedFooter = ({ children }) => <footer>{children}</footer>;
TypedFooter.__TYPE = 'CustomFooter';

const AnonymousComponent = () => <div>Anon</div>;

// == Test Suite ==
describe('React Utilities', () => {
  let children;

  beforeEach(() => {
    const fragment = (
      <>
        <Header>Header 1</Header>
        <div>Plain div</div>
        <Content />
        <TypedFooter>Special Footer</TypedFooter>
        {null}
        {false}
        `&quot;`text node`&quot;`
        <>
          <span>Nested in fragment</span>
          <span>Also nested</span>
        </>
        <Header>Header 2</Header>
        <AnonymousComponent />
      </>
    );
    children = React.Children.toArray(fragment.props.children);
  });

  describe('typeOfComponent()', () => {
    it('returns __TYPE prop when present', () => {
      const el = <TypedFooter />;
      expect(typeOfComponent(el)).to.equal('CustomFooter');
    });

    it('detects React.Fragment as "react.fragment"', () => {
      const el = <></>;
      expect(typeOfComponent(el)).to.equal('react.fragment');
    });

    it('uses displayName when available', () => {
      const el = <Header />;
      expect(typeOfComponent(el)).to.equal('Header');
    });

    it('falls back to function name', () => {
      function LegacyComponent() {
        return null;
      }
      const el = <LegacyComponent />;
      expect(typeOfComponent(el)).to.equal('LegacyComponent');
    });

    it('returns name for anonymous components without name/displayName', () => {
      const el = <AnonymousComponent />;
      expect(typeOfComponent(el)).to.equal('AnonymousComponent');
    });

    it('returns undefined for non-elements (null, string, etc.)', () => {
      expect(typeOfComponent(null)).to.be.undefined;
      expect(typeOfComponent('text')).to.be.undefined;
      expect(typeOfComponent(123)).to.be.undefined;
    });
  });

  describe('getChildByType()', () => {
    it('finds first child by displayName', () => {
      const header = getChildByType(children, 'Header');
      expect(header.type.displayName).to.equal('Header');
      expect(React.isValidElement(header)).to.be.true;
    });

    it('finds first child by __TYPE', () => {
      const footer = getChildByType(children, 'CustomFooter');
      expect(footer.type.__TYPE).to.equal('CustomFooter');
    });

    it('finds first fragment when requested', () => {
      const fragment = getChildByType(children, 'react.fragment');
      expect(fragment.type).to.equal(React.Fragment);
    });

    it('accepts array of types', () => {
      const match = getChildByType(children, ['Content', 'div']);
      expect(match.type).to.equal('div'); // div comes first
    });

    it('returns undefined when nothing matches', () => {
      const none = getChildByType(children, 'DoesNotExist');
      expect(none).to.be.undefined;
    });

    it('ignores invalid children (null, false, text)', () => {
      const test = (
        <>
          {null}
          false `&quot;`text`&quot;`
          <Header />
        </>
      );
      const header = getChildByType(
        React.Children.toArray(test.props.children),
        'Header',
      );
      expect(header).to.not.be.undefined;
    });
  });

  describe('getChildrenByType()', () => {
    it('returns all matching children', () => {
      const headers = getChildrenByType(children, 'Header');
      expect(headers).to.have.length(2);
      expect(headers.every(h => h.type.displayName === 'Header')).to.be.true;
    });

    it('works with multiple types', () => {
      const result = getChildrenByType(children, ['Header', 'div']);
      expect(result).to.have.length(3); // 2 Header + 1 div
    });

    it('returns empty array when no match', () => {
      expect(getChildrenByType(children, 'Nope')).to.deep.equal([]);
    });

    it('handles single string or array consistently', () => {
      expect(getChildrenByType(children, 'Header')).to.have.length(2);
      expect(getChildrenByType(children, ['Header'])).to.have.length(2);
    });
  });

  describe('groupChildrenByType()', () => {
    it('groups children correctly by type', () => {
      const groups = groupChildrenByType(children);

      expect(groups).to.have.property('Header').that.has.length(2);
      expect(groups).to.have.property('div').that.has.length(1);
      expect(groups).to.have.property('Content').that.has.length(1);
      expect(groups).to.have.property('CustomFooter').that.has.length(1);
      expect(groups).to.have.property('react.fragment').that.has.length(1);
      expect(groups).to.have.property('AnonymousComponent').that.has.length(1);
    });

    it('handles empty children', () => {
      expect(groupChildrenByType(null)).to.deep.equal({});
      expect(groupChildrenByType(undefined)).to.deep.equal({});
    });

    it('includes only valid elements in groups', () => {
      const withJunk = (
        <>
          null
          {false}
          <Header />
        </>
      );
      const groups = groupChildrenByType(
        React.Children.toArray(withJunk.props.children),
      );
      expect(Object.keys(groups)).to.have.length(1);
      expect(groups.Header).to.have.length(1);
      expect(groups).not.to.have.property('unknown');
    });
  });
});
