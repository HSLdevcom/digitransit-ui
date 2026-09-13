import React from 'react';
import { configShape } from '../util/shapes';

const TitleComponent = (props, { config: { title } }) => <span>{title}</span>;

TitleComponent.contextTypes = { config: configShape.isRequired };

export default TitleComponent;
