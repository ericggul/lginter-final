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
    </UI.Form>
  );
}


