import HiddenForm from '../sections/HiddenForm';
import PressOverlay from '../sections/PressOverlay';
import * as UI from '../styles';

export default function InputForm({
  name,
  onNameChange,
  mood,
  onMoodChange,
  onSubmit,
  showPress,
  isListening,
  pressProgress,
  onPressStart,
  onPressEnd,
  showTextFallback,
}) {
  return (
    <UI.Form onSubmit={onSubmit}>
      <HiddenForm
        name={name}
        onNameChange={onNameChange}
        mood={mood}
        onMoodChange={onMoodChange}
        visible={showTextFallback}
      />

      {showPress && !isListening && !showTextFallback && (
        <PressOverlay
          pressProgress={pressProgress}
          onPressStart={onPressStart}
          onPressEnd={onPressEnd}
        />
      )}

      {/* 디버깅용: 가짜 입력란 (손쉽게 삭제 가능) */}
      {showPress && !isListening && !showTextFallback && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 16,
            zIndex: 2800,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 8,
            padding: '6px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.55)', marginBottom: 4 }}>가짜 입력란</div>
          <input
            type="text"
            placeholder="여기에 텍스트 입력"
            value={mood}
            onChange={(e) => onMoodChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                try {
                  e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                } catch {}
              }
            }}
            style={{
              width: 240,
              height: 32,
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 6,
              padding: '0 8px',
              background: 'rgba(255,255,255,0.9)'
            }}
          />
        </div>
      )}
    </UI.Form>
  );
}


