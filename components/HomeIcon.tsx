import { colors } from "@/constants/Colors";
import React from "react";
import { Path, Svg } from "react-native-svg";

interface IconProps {
  isFocused: boolean;
  filled?: boolean;
  color?: string;
}

export default function HomeIcon({ isFocused, filled, color }: IconProps) {
  // Use provided color or default based on focus state
  const iconColor =
    color || (isFocused ? colors.icon.focused : colors.icon.unfocused);
  const shouldFill = isFocused;

  return (
    <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 7C15.6 7 15.2 7.1 14.9 7.3L7 13.5V25C7 25.5304 7.21071 26.0391 7.58579 26.4142C7.96086 26.7893 8.46957 27 9 27H13V21C13 20.4477 13.4477 20 14 20H18C18.5523 20 19 20.4477 19 21V27H23C23.5304 27 24.0391 26.7893 24.4142 26.4142C24.7893 26.0391 25 25.5304 25 25V13.5L17.1 7.3C16.8 7.1 16.4 7 16 7Z"
        fill={shouldFill ? iconColor : "transparent"}
        stroke={iconColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
