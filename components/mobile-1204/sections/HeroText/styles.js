// Styles for HeroText (mobile intro copy) using styled-components

import styled from 'styled-components';
import { fonts, spacing, typography, colors } from '../styles/tokens';

export const Container = styled.div`
  margin-bottom: ${spacing.hero.blockMarginBottom};
`;

export const Title = styled.h1`
  font-size: ${typography.heroTitleSize};
  color: ${colors.textPrimary};
  margin-bottom: 0.25rem;
  font-weight: ${typography.heroTitleWeight};
  text-align: ${(p) => (p.$isModal ? 'center' : 'left')};
  line-height: ${typography.heroTitleLineHeight};
  font-family: ${fonts.ui};
  opacity: ${(p) => p.$opacity};
  transform: ${(p) => (p.$opacity ? 'translateY(0)' : 'translateY(12px)')};
  filter: ${(p) => (p.$opacity ? 'blur(0px)' : 'blur(12px)')};
  transition: ${(p) =>
    `opacity ${p.$fadeMs}ms ease, transform ${p.$fadeMs + 150}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${
      p.$fadeMs + 150
    }ms ease`};
`;

export const Sub = styled.p`
  font-size: clamp(1.1rem, 3.7vw, 1.25rem);
  color: ${colors.textSecondary};
  margin-top: ${spacing.hero.subtextMarginTop};
  font-weight: 500;
  text-align: ${(p) => (p.$isModal ? 'center' : 'left')};
  font-family: ${fonts.ui};
  opacity: ${(p) => p.$opacity};
  transform: ${(p) => (p.$opacity ? 'translateY(0)' : 'translateY(10px)')};
  filter: ${(p) => (p.$opacity ? 'blur(0px)' : 'blur(10px)')};
  transition: ${(p) =>
    `opacity ${p.$fadeMs}ms ease, transform ${p.$fadeMs + 150}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${
      p.$fadeMs + 150
    }ms ease`};
`;



