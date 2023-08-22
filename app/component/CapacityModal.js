/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const CapacityModal = ({}) => {
  return (
    <div className="capacity-information-modal">
      <h2 className="capacity-heading">Onko kulkuneuvossa tilaa?</h2>
      <p className="capacity-text">
        Osasta kulkuneuvoja on saatavilla reaaliaikainen kapasiteettitieto.
      </p>
      <span className="explanations-heading">Merkkien selitteet</span>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_many-seats-available"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">Ei tungosta</span>
      </div>
      <p className="capacity-info-explanation">Paljon istumapaikkoja</p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_few-seats-available"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">Ei liikaa tungosta</span>
      </div>
      <p className="capacity-info-explanation">Joitakin istumapaikkoja</p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_standing-room-only"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">Lähes täynnä</span>
      </div>
      <p className="capacity-info-explanation">
        Vain vähän istuma- ja seisomapaikkoja
      </p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_crushed_standing_room_only"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">Kova tungos</span>
      </div>
      <p className="capacity-info-explanation">Vain vähän seisompaikkoja</p>
      <div className="capacity-info-row">
        <div className="icon">
          <Icon
            img="icon-icon_full-capacity"
            color="red"
            width="1.5"
            height="1.5"
          />
        </div>
        <span className="info-heading">Täynnä</span>
      </div>
      <p className="capacity-info-explanation">Ei vapaita paikkoja</p>
    </div>
  );
};

CapacityModal.propTypes = {};

CapacityModal.defaultProps = {};

export default CapacityModal;
