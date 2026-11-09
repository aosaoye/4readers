import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from './theme';

export interface CustomSwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  activeColor?: string;
  inactiveTrackColor?: string;
  inactiveBorderColor?: string;
  inactiveThumbColor?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/**
 * Switch animado unificado según el estándar visual del proyecto (52x32px).
 * Color activo obligatorio: NARANJA (#E4531D / colors.accent).
 * Prohibido usar el switch nativo de React Native en todo el proyecto.
 */
export function CustomSwitch({
  value,
  onValueChange,
  activeColor,
  inactiveTrackColor = '#171A1F',
  inactiveBorderColor = '#383F4A',
  inactiveThumbColor = '#3C434F',
  disabled = false,
  accessibilityLabel,
  style,
}: CustomSwitchProps) {
  const resolvedActiveColor = activeColor ?? (colors.accent || '#E4531D');
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      tension: 90,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveTrackColor, resolvedActiveColor],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveBorderColor, resolvedActiveColor],
  });

  const thumbColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveThumbColor, '#FFFFFF'],
  });

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          onValueChange(!value);
        }
      }}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View
        style={[
          s.track,
          {
            backgroundColor,
            borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            s.thumb,
            {
              backgroundColor: thumbColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 1,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
    elevation: 3,
  },
});
