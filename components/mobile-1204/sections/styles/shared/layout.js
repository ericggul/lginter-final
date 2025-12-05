// Styled layout components for mobile
// Converted from object helpers to styled-components

import styled from 'styled-components';
import { spacing, fonts } from '../tokens';

export const AppContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$isModal ? 'center' : 'flex-start')};
  justify-content: ${(p) => (p.$isModal ? 'center' : 'flex-start')};
  font-family: ${fonts.system};
  padding-top: ${(p) => (p.$isModal ? '2rem' : spacing.container.paddingTop)};
  padding-right: ${(p) => (p.$isModal ? '2rem' : spacing.container.paddingRight)};
  padding-bottom: ${(p) => (p.$isModal ? '2rem' : spacing.container.paddingBottom)};
  padding-left: ${(p) => (p.$isModal ? '2rem' : spacing.container.paddingLeft)};
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

export const ContentWrapper = styled.div`
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  border: none;
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: ${(p) => (p.$isModal ? 'center' : 'flex-start')};
  
  /* Allow text selection and callout inside actual form fields */
  input, textarea {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
    -webkit-touch-callout: default;
  }
`;

