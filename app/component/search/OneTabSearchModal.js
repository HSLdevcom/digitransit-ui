import React from "react";
import Tab from "material-ui/Tabs/Tab";
import GeolocationOrInput from "./GeolocationOrInput";
import { setEndpoint, setUseCurrent } from "../../action/EndpointActions";
import { executeSearch } from "../../action/SearchActions";
import SearchModal from "./SearchModal";

import { intlShape } from "react-intl";

class OneTabSearchModal extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired
  };

  static propTypes = {
    modalIsOpen: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]).isRequired,
    closeModal: React.PropTypes.func.isRequired,
    initialValue: React.PropTypes.string.isRequired,
    endpoint: React.PropTypes.object,
    target: React.PropTypes.oneOfType([React.PropTypes.bool, React.PropTypes.string]),
    customTabLabel: React.PropTypes.string,
    customOnSuggestionSelected: React.PropTypes.func
  };

  componentDidUpdate(prevProps, prevState) {
    let ref;
    let ref1;

    if (this.props.modalIsOpen) {
      setTimeout(() => {
        let ref2;
        let ref1;
        let ref;
        return (ref = this.refs.geolocationOrInput) != null ? (ref1 = ref.refs.searchInput.refs.autowhatever) != null ? (ref2 = ref1.refs.input) != null ? ref2.focus() : void 0 : void 0 : void 0;
      }, 0);

      if (!this.props.endpoint) {
        return this.context.executeAction(executeSearch, {
          input: "",
          type: "endpoint"
        });
      } else if (this.props.target === "origin") {
        return this.context.executeAction(executeSearch, {
          input: ((ref1 = this.context.getStore("EndpointStore").getOrigin()) != null ? ref1.address : void 0) || "",
          type: "endpoint"
        });
      } else if (this.props.target === "destination") {
        return this.context.executeAction(executeSearch, {
          input: ((ref = this.context.getStore("EndpointStore").getDestination()) != null ? ref.address : void 0) || "",
          type: "endpoint"
        });
      }
    }
  }

  render() {
    const searchTabLabel = (() => {
      if (this.props.customTabLabel) {
        return this.props.customTabLabel;
      } else {
        return this.context.intl.formatMessage({
          id: this.props.target || "origin",
          defaultMessage: this.props.target || "origin"
        });
      }
    })();

    return <SearchModal selectedTab="tab" modalIsOpen={this.props.modalIsOpen} closeModal={this.props.closeModal}><Tab className="search-header__button--selected" label={searchTabLabel} value="tab"><GeolocationOrInput ref="geolocationOrInput" initialValue={this.props.initialValue} type="endpoint" endpoint={this.props.endpoint} onSuggestionSelected={(() => {
          if (this.props.customOnSuggestionSelected) {
            return this.props.customOnSuggestionSelected;
          } else {
            return (name, item) => {
              if (item.type === "CurrentLocation") {
                this.context.executeAction(setUseCurrent, this.props.target);
              } else {
                this.context.executeAction(setEndpoint, {
                  "target": this.props.target,

                  "endpoint": {
                    lat: item.geometry.coordinates[1],
                    lon: item.geometry.coordinates[0],
                    address: name
                  }
                });
              }

              return this.props.closeModal();
            };
          }
        })()} /></Tab></SearchModal>;
  }
}

export default OneTabSearchModal;
