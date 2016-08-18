import React from "react";
import Icon from "../icon/icon";
import cx from "classnames";

import { FormattedMessage } from "react-intl";

import connectToStores from "fluxible-addons-react/connectToStores";
import pure from "recompose/pure";

const Locate = () => {
  return <span> - <span className="search-position"><FormattedMessage id="search-position" defaultMessage="Locate" /></span></span>;
};

const CurrentPositionSuggestionItem = pure(({
  item,
  havePosition
}) => {
  return <span className={cx("search-result", item.type)}><span><span className="autosuggestIcon"><Icon img="icon-icon_position" className={cx("havePosition")} /></span><FormattedMessage id="use-own-position" defaultMessage="Use Your current location" />{(() => {
        if (!havePosition) {
          return <Locate />;
        }
      })()}</span></span>;
});

export default connectToStores(CurrentPositionSuggestionItem, ["PositionStore"], (context, props) =>
  ({
    havePosition: context.getStore("PositionStore").getLocationState().hasLocation
  })
);
