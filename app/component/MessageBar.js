import cx from 'classnames';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { graphql, fetchQuery, ReactRelayContext } from 'react-relay';
import { relayShape } from '../util/shapes';
import { useConfigContext } from '../configurations/ConfigContext';
import { withCurrentTime } from '../hooks/TimeContext';
import {
  useMessages,
  useDuplicateMessageCounter,
  useMessageActions,
} from '../hooks/MessageContext';
import SwipeableTabs from './SwipeableTabs';
import Icon from './Icon';
import MessageBarMessage from './MessageBarMessage';
import { getReadMessageIds } from '../data/localStorage';
import { mapAlertSource } from '../util/alertUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import hashCode from '../util/hashUtil';

/* Small version has constant height,
 * big version has max height of half but can be
 * less if the message is shorter.
 */

const fetchServiceAlerts = async (feedids, relayEnvironment) => {
  const query = graphql`
    query MessageBarQuery($feedids: [String!]) {
      alerts: alerts(severityLevel: [SEVERE], feeds: $feedids) {
        feed
        id
        alertDescriptionText
        alertHash
        alertHeaderText
        alertSeverityLevel
        alertUrl
        effectiveEndDate
        effectiveStartDate
      }
    }
  `;

  const result = await fetchQuery(relayEnvironment, query, {
    feedids,
  }).toPromise();
  return result && Array.isArray(result.alerts) ? result.alerts : [];
};

export const getServiceAlertId = alert =>
  hashCode(
    `${alert.alertDescriptionText}
     ${alert.alertHeaderText}
     ${alert.alertSeverityLevel}
     ${alert.effectiveEndDate}
     ${alert.effectiveStartDate}
     ${alert.feed}`,
  );

const toMessage = (alert, intl, config, lang) => {
  const source = mapAlertSource(config, lang, alert.feed);
  const content = {};
  content[lang] = [
    {
      type: 'heading',
      content: source
        ? source.concat(alert.alertHeaderText)
        : alert.alertHeaderText,
    },
    { type: 'text', content: alert.alertDescriptionText },
    {
      type: 'a',
      content: intl.formatMessage({ id: 'extra-info' }),
      href: alert.alertUrl,
    },
  ];

  return {
    content,
    icon: 'caution',
    id: getServiceAlertId(alert),
    persistence: 'repeat',
    type: 'disruption',
  };
};

// Resolve a message's content array for rendering.
// New shape: content is a flat array of { type, content: translationKey }
// Old shape: content is an object keyed by locale { fi: [...], en: [...] }
const resolveContent = (msg, lang, intl) => {
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter(
        item => !item.content || intl.messages[item.content] !== undefined,
      )
      .map(item => ({
        ...item,
        content: intl.formatMessage({ id: item.content }),
      }));
  }
  return msg.content[lang] || msg.content.fi;
};

/**
 * Returns true if a message element has renderable content for the given
 * language. Content may be a plain array (already resolved) or a map keyed
 * by locale; in the latter case the requested language is tried first,
 * falling back to Finnish. A message is considered valid when the resolved
 * value is a non-empty array whose first item carries actual content text.
 */
const hasContent = (el, lang) => {
  const resolved = Array.isArray(el.content)
    ? el.content
    : el.content[lang] || el.content.fi;
  return Array.isArray(resolved) && resolved.length > 0 && resolved[0].content;
};

function MessageBar({
  currentTime,
  getServiceAlertsAsync = fetchServiceAlerts,
  lang,
  messages,
  relayEnvironment,
  duplicateMessageCounter,
  breakpoint = undefined,
  markMessageAsRead = () => {},
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const [slideIndex, setSlideIndex] = useState(0);
  const [allAlertsOpen, setAllAlertsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [serviceAlerts, setServiceAlerts] = useState([]);

  const onSwipe = e => {
    setSlideIndex(e);
  };

  const openAllAlerts = () => {
    setAllAlertsOpen(true);
  };

  // Runs once on mount, mirroring the previous class component's
  // componentDidMount; currentTime/getServiceAlertsAsync/relayEnvironment/
  // config are treated as stable for the lifetime of a single mount here.
  useEffect(() => {
    const feedIds =
      Array.isArray(config.feedIds) && config.feedIds.length > 0
        ? config.feedIds
        : null;
    if (config.messageBarAlerts) {
      getServiceAlertsAsync(feedIds, relayEnvironment)
        .then(alerts => {
          setReady(true);
          setServiceAlerts(
            uniqBy(
              alerts.filter(
                alert =>
                  alert.effectiveStartDate <= currentTime &&
                  alert.effectiveEndDate >= currentTime,
              ),
              alert => alert.alertHash,
            ),
          );
        })
        .catch(() => {
          setReady(true);
          setServiceAlerts([]);
        });
    } else {
      setReady(true);
      setServiceAlerts([]);
    }
  }, []);

  const validMessages = () => {
    const readMessageIds = getReadMessageIds();
    const filteredServiceAlerts = serviceAlerts.filter(
      alert => readMessageIds.indexOf(getServiceAlertId(alert)) === -1,
    );
    return [
      ...filteredServiceAlerts.map(alert =>
        toMessage(alert, intl, config, lang),
      ),
      ...messages,
    ].filter(el => hasContent(el, lang));
  };

  const getTabContent = (textColor, index) =>
    validMessages().map((el, i) => (
      <div key={el.id} className={`swipeable-tab ${index !== i && 'inactive'}`}>
        <MessageBarMessage
          key={el.id}
          content={resolveContent(el, lang, intl)}
          textColor={textColor}
          truncate={!allAlertsOpen}
          onShowMore={openAllAlerts}
        />
      </div>
    ));

  const handleClose = () => {
    const currentMessages = validMessages();
    const index = slideIndex;
    const msgId = currentMessages[index].id;

    setSlideIndex(Math.max(0, index - 1));
    markMessageAsRead(msgId);
  };

  if (!ready) {
    return null;
  }
  const currentMessages = validMessages();
  if (currentMessages.length === 0) {
    return null;
  }

  const index = Math.min(slideIndex, currentMessages.length - 1);
  const msg = currentMessages[index];
  const type = msg.type || 'info';
  const icon = msg.icon || 'info';
  // eslint-disable-next-line prefer-destructuring
  const iconColor = msg.iconColor;
  const iconName = `icon_${icon}`;
  const isDisruption = msg.type === 'disruption';
  const backgroundColor = msg.backgroundColor || '#fff';
  const textColor = isDisruption ? '#fff' : msg.textColor || '#000';
  const dataURI = msg.dataURI || null;
  const ariaContent = (content, id) => {
    return (
      <span key={`message-${id}`}>
        {content.map(e => (
          <span key={`message-content-${id}-${e.type}`}>{e.content}</span>
        ))}
      </span>
    );
  };
  return (
    <>
      <span className="sr-only" role="alert">
        {currentMessages.map(el =>
          ariaContent(resolveContent(el, lang, intl), el.id),
        )}
      </span>
      <section
        key={duplicateMessageCounter}
        id="messageBar"
        className="message-bar flex-horizontal"
        style={{ background: backgroundColor }}
      >
        <div
          className={cx('banner-container', {
            'banner-disruption': isDisruption,
          })}
        >
          <Icon
            img={iconName}
            color={iconColor}
            dataURI={dataURI}
            className="message-icon"
          />
          <div className={`message-bar-content message-bar-${type}`}>
            <div>
              <div className="message-bar-container">
                <div
                  style={{
                    background: isDisruption ? 'inherit' : backgroundColor,
                  }}
                >
                  {currentMessages.length > 1 ? (
                    <SwipeableTabs
                      tabIndex={index}
                      tabs={getTabContent(textColor, slideIndex)}
                      onSwipe={onSwipe}
                      hideArrows={breakpoint !== 'large'}
                      navigationOnBottom
                      ariaRole="swipe-message-bar-tab"
                    />
                  ) : (
                    <div className="single-alert">
                      {getTabContent(textColor, slideIndex)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <button
              id="close-message-bar"
              title={intl.formatMessage({
                id: 'messagebar-label-close-message-bar',
                defaultMessage: 'Close banner',
              })}
              onClick={handleClose}
              onKeyDown={e => {
                if (isKeyboardSelectionEvent(e)) {
                  handleClose();
                }
              }}
              className="noborder close-button  cursor-pointer"
              type="button"
            >
              <Icon img="icon_close" className="close" color="#333333" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

MessageBar.propTypes = {
  currentTime: PropTypes.number.isRequired,
  getServiceAlertsAsync: PropTypes.func,
  lang: PropTypes.string.isRequired,
  // eslint-disable-next-line
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  relayEnvironment: relayShape.isRequired,
  duplicateMessageCounter: PropTypes.number.isRequired,
  breakpoint: PropTypes.string,
  markMessageAsRead: PropTypes.func,
};

const MessageBarWithConfig = props => {
  const { language: lang } = useConfigContext();
  return (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <MessageBar {...props} lang={lang} relayEnvironment={environment} />
      )}
    </ReactRelayContext.Consumer>
  );
};

const MessageBarWithTime = withCurrentTime(MessageBarWithConfig);

const ConnectedMessageBar = props => {
  const messages = useMessages();
  const duplicateMessageCounter = useDuplicateMessageCounter();
  const { markMessageAsRead } = useMessageActions();
  return (
    <MessageBarWithTime
      {...props}
      messages={messages}
      duplicateMessageCounter={duplicateMessageCounter}
      markMessageAsRead={markMessageAsRead}
    />
  );
};

export { ConnectedMessageBar as default, MessageBar as Component };
