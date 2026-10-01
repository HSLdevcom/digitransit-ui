import React from 'react';
import { useConfigContext } from '../client/ConfigContext';

const Title = () => {
  const { title } = useConfigContext();
  return <span>{title}</span>;
};

export default Title;
