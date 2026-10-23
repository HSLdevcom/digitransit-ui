import React from 'react';
import { useConfigContext } from '../hooks/ConfigContext';

const Title = () => {
  const { title } = useConfigContext();
  return <span>{title}</span>;
};

export default Title;
