import React from 'react';
import { ConfigShape } from '../util/shapes';

const TitleComponent = (props, { config: { title } }) => <span>{title}</span>;

TitleComponent.contextTypes = { config: ConfigShape.isRequired };

export default TitleComponent;
