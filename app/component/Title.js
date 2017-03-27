import React from 'react';

const TitleComponent = (props, { config: { title } }) => <span>{title}</span>;

TitleComponent.contextTypes = { config: React.PropTypes.object.isRequired };

export default TitleComponent;
