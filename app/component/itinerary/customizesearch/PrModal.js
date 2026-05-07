import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import Icon from '../../Icon';
import ExternalLink from '../../ExternalLink';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useBreakpoint } from '../../../util/withBreakpoint';

export default function PrModal({ closeModal }) {
  const config = useConfigContext();
  const intl = useIntl();
  const breakpoint = useBreakpoint();

  return (
    <Modal lang={config.language} onOpenChange={closeModal} open>
      <ModalContent
        title={intl.formatMessage({ id: 'personalization-modal-header' })}
        lang={config.language}
      >
        <div
          className={cx('pr-info-modal', {
            'pr-info-mobile': breakpoint !== 'large',
          })}
        >
          <div className="pr-info-content">
            <Icon
              img="icon_star-with-circle"
              color="#666"
              height={2}
              width={2}
            />
            <div className="pr-info-text-area">
              <h3>
                <FormattedMessage id="personalization-modal-highlight" />
              </h3>
              <FormattedMessage id="personalization-modal-highlight-details" />
              {config.favouriteLink[config.language] && (
                <ExternalLink
                  href={config.favouriteLink[config.language]}
                  withArrow
                >
                  <FormattedMessage id="personalization-modal-link" />
                </ExternalLink>
              )}
            </div>
          </div>
          <div className="pr-info-content">
            <Icon img="icon_thumb" color="#666" height={2} width={2} />
            <div className="pr-info-text-area">
              <h3>
                <FormattedMessage id="personalization-modal-feedback" />
              </h3>
              <FormattedMessage id="personalization-modal-feedback-details" />
            </div>
          </div>
          <div className="pr-beta">
            {breakpoint === 'large' && (
              <div className="icon-area">
                <Icon
                  img="personalization"
                  color={config.colors.primary}
                  height={5}
                  width={5}
                />
              </div>
            )}
            <div
              className={cx('beta-desc', {
                'beta-desc-mobile': breakpoint !== 'large',
              })}
            >
              <span className="beta-label">Beta</span>
              <span>
                <FormattedMessage id="personalization-beta" />
              </span>
              <button
                type="button"
                className="beta-feedback-button"
                onClick={() => {}}
              >
                <FormattedMessage id="personalization-feedback" />
              </button>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

PrModal.propTypes = { closeModal: PropTypes.func.isRequired };
