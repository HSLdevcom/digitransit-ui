import React from "react";
import MaterialModal from "material-ui/Dialog";
import Icon from "../icon/icon";
import intl from "react-intl";
import Tabs from "material-ui/Tabs/Tabs";
import config from "../../config";

class SearchModal extends React.Component {
  constructor() {
    super(...arguments);
    this.render = this.render.bind(this);
  }

  render() {
    if (!this.props.modalIsOpen) {
      return false;
    } else {
      return <div className="search-modal"><div className="row fullscreen"><div className="small-12 columns cursor-pointer search-header"><div className="search-header__back-arrow" onClick={this.props.closeModal}><Icon img="icon-icon_arrow-left" /><span className="search-header-separator" /></div><Tabs className="search-header__tabs-root" inkBarStyle={{
              backgroundColor: config.colors.primary,
              bottom: "auto",
              top: -43
            }} value={this.props.selectedTab}>{this.props.children}</Tabs></div></div></div>;
    }
  }
}

export default SearchModal;
