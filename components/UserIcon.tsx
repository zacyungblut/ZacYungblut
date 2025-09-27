import { colors } from "@/constants/Colors";
import React from "react";
import { Path, Svg } from "react-native-svg";

interface IconProps {
  isFocused: boolean;
  filled?: boolean;
  color?: string;
}

export default function ProfileIcon({ isFocused, filled, color }: IconProps) {
  // Use provided color or default based on focus state
  const iconColor =
    color || (isFocused ? colors.icon.focused : colors.icon.unfocused);
  const strokeWidth = isFocused ? 2 : 1.8;
  const shouldFill = isFocused;

  return (
    <Svg width={26} height={26} viewBox="0 0 32 32" fill="none">
      <Path
        d="M5 29V28C5 22 10 18 16 18C22 18 27 22 27 28V29H5Z"
        fill={shouldFill ? iconColor : "transparent"}
        stroke={iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 14C19 14 21.5 11.5 21.5 8.5C21.5 5.5 19 3 16 3C13 3 10.5 5.5 10.5 8.5C10.5 11.5 13 14 16 14Z"
        fill={shouldFill ? iconColor : "transparent"}
        stroke={iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
