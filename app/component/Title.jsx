import React from 'react';
import { useConfigContext } from '../hooks/ConfigContext';

export default function Title() {
  const { title } = useConfigContext();
  return <span>{title}</span>;
}
