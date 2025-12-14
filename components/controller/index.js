import { useEffect, useMemo, useState } from 'react';
import useSocketController from '@/utils/hooks/useSocketController';
import useControllerFlow from './hooks/useControllerFlow';
import { CONTROLLER_SYSTEM_MIN_PROMPT, CONTROLLER_SYSTEM_PROMPT, SW2_MAPPING_PROMPT } from '@/ai/prompts/controller';
import { EV } from '@/src/core/events';
import {
  Container,
  TopSection,
  BottomSection,
  UserCountCard,
  UserCountLabel,
  UserCountValue,
  ResetButton,
  HardResetButton,
  SettingsPanel,
  SettingsTitle,
  SettingsGrid,
  SettingCard,
  SettingLabel,
  SettingValue,
  ScreenStatusPanel,
  ScreenStatusTitle,
  ScreenGroup,
  ScreenGroupLabel,
  ScreenDeviceGrid,
  DeviceChip,
  UserSelectionTitle,
  UserGrid,
  UserCard,
  UserCardLabel,
  UserCardContent,
} from './styles';

export default function ControllerView() {
  const sockets = useSocketController();
  // Admin-editable prompt used in structured-output path
  const [promptOverride, setPromptOverride] = useState('');
  const [promptDraft, setPromptDraft] = useState('');
  const orchestrator = useControllerFlow({ emit: sockets.emit, systemPrompt: promptOverride });
  useEffect(() => {
    sockets.updateHandlers?.({
      onNewUser: orchestrator.onNewUser,
      onNewName: orchestrator.onNewName,
      onNewVoice: orchestrator.onNewVoice,
      onDeviceHeartbeat: orchestrator.onDeviceHeartbeat,
    });
  }, [orchestrator.onNewUser, orchestrator.onNewName, orchestrator.onNewVoice, orchestrator.onDeviceHeartbeat]);

  const snapshot = orchestrator.snapshot || {};
  const users = snapshot.users || [];
  const assignments = snapshot.assignments || {};
  const lastDecision = snapshot.lastDecision || null;
  const handleHardReset = () => {
    sockets.emit?.(EV.HARD_RESET, { ts: Date.now(), source: 'controller' });
  };

  return (
    <Container>
      <TopSection>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
          <UserCountCard>
            <UserCountLabel>서버에 입장한<br />사람의 수</UserCountLabel>
            <UserCountValue>{users.length}</UserCountValue>
          </UserCountCard>
          <HardResetButton onClick={handleHardReset}>
            하드 리셋
            <br />
            (전체 새로고침)
          </HardResetButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
          <SettingsPanel>
            <SettingsTitle>AI Prompt & 결과(관리자용)</SettingsTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', zIndex: 9999 }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPromptDraft(CONTROLLER_SYSTEM_PROMPT)}
                    style={{
                      background: '#EFEFEF',
                      color: '#222',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.9rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    긴 버전 불러오기
                  </button>
                  <button
                    onClick={() => setPromptDraft(CONTROLLER_SYSTEM_MIN_PROMPT)}
                    style={{
                      background: '#EFEFEF',
                      color: '#222',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.9rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    짧은 버전 불러오기
                  </button>
                  <button
                    onClick={() => setPromptDraft(SW2_MAPPING_PROMPT)}
                    style={{
                      background: '#E5F4FF',
                      color: '#074B7A',
                      border: '1px solid rgba(7,75,122,0.18)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.9rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    SW2 매핑 프롬프트 불러오기
                  </button>
                </div>
                <SettingLabel>시스템 프롬프트(구조화 출력용)</SettingLabel>
                <textarea
                  value={promptDraft}
                  onChange={(e) => setPromptDraft(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '20rem',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'white',
                    color: 'inherit',
                    zIndex: 1000,
                    resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => setPromptOverride(promptDraft)}
                    style={{
                      background: '#2D6AE3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.75rem 1.2rem',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(45,106,227,0.25)',
                    }}
                  >
                    프롬프트 적용
                  </button>
                </div>
              </div>
              <div>
                <SettingLabel>최근 결정 결과(JSON)</SettingLabel>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    width: '100%',
                    minHeight: '18rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.04)',
                    fontSize: '0.9rem',
                  }}
                >
                  {JSON.stringify(
                    lastDecision
                      ? {
                          params: lastDecision.env,
                          reason: lastDecision.reason,
                          flags: lastDecision.flags,
                          emotionKeyword: lastDecision.emotionKeyword,
                        }
                      : {},
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </SettingsPanel>

          <SettingsPanel>
            <SettingsTitle>결정된 4가지 설정 스테이트</SettingsTitle>
            <SettingsGrid>
              <SettingCard>
                <SettingLabel>설정 온도:</SettingLabel>
                <SettingValue>{assignments.temperature?.value ?? ''}</SettingValue>
              </SettingCard>
              <SettingCard>
                <SettingLabel>설정 습도:</SettingLabel>
                <SettingValue>{assignments.humidity?.value ?? ''}</SettingValue>
              </SettingCard>
              <SettingCard>
                <SettingLabel>설정 조명 컬러:</SettingLabel>
                <SettingValue>{assignments.light?.value ?? ''}</SettingValue>
              </SettingCard>
              <SettingCard>
                <SettingLabel>설정 음악:</SettingLabel>
                <SettingValue>{assignments.music?.value ?? ''}</SettingValue>
              </SettingCard>
            </SettingsGrid>
          </SettingsPanel>
        </div>
      </TopSection>

      <BottomSection>
        <ScreenStatusPanel>
          <ScreenStatusTitle>스크린 상태 체크(오류 상황)</ScreenStatusTitle>

          <ScreenGroup>
            <ScreenGroupLabel>현관3</ScreenGroupLabel>
            <ScreenDeviceGrid>
              {['mw1', 'tv1', 'sbm1'].map((id) => {
                const status = orchestrator.getDeviceStatus(id);
                return (
                  <DeviceChip key={id} $status={status}>
                    {id.toUpperCase()}
                  </DeviceChip>
                );
              })}
            </ScreenDeviceGrid>
          </ScreenGroup>

          <ScreenGroup>
            <ScreenGroupLabel>거실3</ScreenGroupLabel>
            <ScreenDeviceGrid>
              {['sw1', 'sw2', 'tv2'].map((id) => {
                const status = orchestrator.getDeviceStatus(id);
                return (
                  <DeviceChip key={id} $status={status}>
                    {id.toUpperCase()}
                  </DeviceChip>
                );
              })}
            </ScreenDeviceGrid>
          </ScreenGroup>
        </ScreenStatusPanel>

        <SettingsPanel>
          <SettingsTitle>각 사용자 선택 사항</SettingsTitle>
          <UserGrid>
            {users.slice(0, 6).map((user, idx) => (
              <UserCard key={user.userId || idx}>
                <UserCardLabel>{user.name || `M${idx + 1}`}</UserCardLabel>
                <UserCardContent>
                  {user.needs?.temperature && <div>온도: {user.needs.temperature}</div>}
                  {user.needs?.humidity && <div>습도: {user.needs.humidity}</div>}
                  {user.needs?.light && <div>조명: {user.needs.light}</div>}
                  {user.needs?.music && <div>음악: {user.needs.music}</div>}
                </UserCardContent>
              </UserCard>
            ))}
            {Array.from({ length: Math.max(0, 6 - users.length) }).map((_, idx) => (
              <UserCard key={`empty-${idx}`}>
                <UserCardLabel>M{users.length + idx + 1}</UserCardLabel>
                <UserCardContent />
              </UserCard>
            ))}
          </UserGrid>
        </SettingsPanel>
      </BottomSection>
    </Container>
  );
}
