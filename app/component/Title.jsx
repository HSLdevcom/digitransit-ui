import React from 'react';
import { configShape } from '../../utils/client/shapes';

const TitleComponent = (props, { config: { title } }) => <span>{title}</span>;

TitleComponent.contextTypes = { config: configShape.isRequired };

export default TitleComponent;
