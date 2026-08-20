import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { ButtonLink, Spacer, Text } from '@hsl-fi/layout-primitives';
import { ArrowLink } from '@hsl-fi/navigation';
import Icon from '../../Icon';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useBreakpoint } from '../../../util/withBreakpoint';

export default function PrModal({ closeModal }) {
  const config = useConfigContext();
  const intl = useIntl();
  const { formatMessage } = intl;
  const breakpoint = useBreakpoint();

  return (
    <Modal lang={config.language} onOpenChange={closeModal} open>
      <ModalContent
        title={formatMessage({ id: 'personalization-modal-header' })}
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
              <Text variant="text-m-bold">
                {formatMessage({ id: 'personalization-modal-highlight' })}
              </Text>
              <Text variant="text-s">
                {formatMessage({
                  id: 'personalization-modal-highlight-details',
                })}
              </Text>
              {config.favouriteLink[config.language] && (
                <ArrowLink href={config.favouriteLink[config.language]}>
                  {formatMessage({ id: 'personalization-modal-link' })}
                </ArrowLink>
              )}
            </div>
          </div>
          <div className="pr-info-content">
            <Icon img="icon_thumb" color="#666" height={2} width={2} />
            <div className="pr-info-text-area">
              <Text variant="text-m-bold">
                <FormattedMessage id="personalization-modal-feedback" />
              </Text>
              <Text variant="text-s">
                {formatMessage({
                  id: 'personalization-modal-feedback-details',
                })}
              </Text>
            </div>
          </div>
          {breakpoint !== 'large' && <Spacer size="xxs" />}
          <div className="pr-beta">
            {breakpoint === 'large' && (
              <div className="icon-area">
                <Icon
                  img="personalization"
                  color={config.colors.primary}
                  height={7.5}
                  width={7.5}
                />
              </div>
            )}
            <div
              className={cx('beta-desc', {
                'beta-desc-mobile': breakpoint !== 'large',
              })}
            >
              <span className="beta-label">Beta</span>
              <Text variant="text-xs">
                {formatMessage({ id: 'personalization-beta' })}
              </Text>
              <Spacer size="xxs" />
              <div>
                <ButtonLink
                  size="s"
                  variant="primary"
                  expandOnMobile
                  href="/foo"
                >
                  {formatMessage({ id: 'personalization-feedback' })}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

PrModal.propTypes = { closeModal: PropTypes.func.isRequired };
