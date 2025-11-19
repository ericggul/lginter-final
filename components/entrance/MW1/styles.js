import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  display: block;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

export const FullscreenVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background: #ffffff;
`;

