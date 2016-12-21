import styled from 'styled-components';
import config from '../../config';

const CardStopCode = styled.p`
  border: 1px solid ${config.theme.colors.lightGray};
  border-radius: ${config.theme.borderRadius.normal};
  font-size: ${config.theme.fontSize.xxsmall};
  color: ${config.theme.colors.grayBlue};
  margin-right: 3px;
  padding: 0px 2px;
`;

export default CardStopCode;
