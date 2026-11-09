import { Text as RNText, TextProps } from 'react-native';
import { ColorName, colors, defaultColor, type, TypeVariant } from './theme';

type Props = TextProps & { variant?: TypeVariant; color?: ColorName };

export function Text({ variant = 'body', color, style, ...rest }: Props) {
  return <RNText {...rest} style={[type[variant], { color: colors[color ?? defaultColor[variant]] }, style]} />;
}
