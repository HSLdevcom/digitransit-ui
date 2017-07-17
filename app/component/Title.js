import PropTypes from 'prop-types';
import React from 'react';

const TitleComponent = (props, { config: { title } }) => <span>{title}</span>;

TitleComponent.contextTypes = { config: PropTypes.object.isRequired };

export default TitleComponent;
