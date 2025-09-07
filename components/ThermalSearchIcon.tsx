import React from "react";
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  Path,
  PathVerb,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  useFrameCallback,
} from "react-native-reanimated";

interface ThermalSearchIconProps {
  size?: number;
  thermalSpeed?: number;
  borderFlowSpeed?: number;
  borderIntensity?: number;
  backgroundHeatIntensity?: number;
}

export function ThermalSearchIcon({
  size = 52,
  thermalSpeed = 0.15,
  borderFlowSpeed = 0.4,
  borderIntensity = 1.1,
  backgroundHeatIntensity = 0.03,
}: ThermalSearchIconProps) {
  const time = useSharedValue(0);

  // Pre-calculate thermal colors
  const thermalColors = React.useMemo(() => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return [r, g, b];
    };

    return {
      uColor1: hexToRgb("000000"),
      uColor2: hexToRgb("073dff"),
      uColor3: hexToRgb("53d5fd"),
      uColor4: hexToRgb("fefcdd"),
      uColor5: hexToRgb("ffec6a"),
      uColor6: hexToRgb("f9d400"),
      uColor7: hexToRgb("a61904"),
    };
  }, []);

  // Create search icon path
  const searchIconPath = React.useMemo(() => {
    const path = Skia.Path.Make();
    const centerX = size / 2;
    const centerY = size / 2;
    const circleRadius = size * 0.22; // Slightly smaller circle to make room for handle
    const strokeWidth = size * 0.06;

    // Create circle outline for magnifying glass
    path.addCircle(centerX - size * 0.08, centerY - size * 0.08, circleRadius);

    // Create handle line - shorter and thicker
    const handleStartX = centerX + size * 0.08;
    const handleStartY = centerY + size * 0.08;
    const handleEndX = centerX + size * 0.28; // Shorter handle (reduced from 0.35)
    const handleEndY = centerY + size * 0.28; // Shorter handle (reduced from 0.35)

    path.moveTo(handleStartX, handleStartY);
    path.lineTo(handleEndX, handleEndY);

    return path;
  }, [size]);

  const thermalShader = Skia.RuntimeEffect.Make(`
    uniform float2 uResolution;
    uniform float uTime;
    uniform float uBackgroundHeatIntensity;
    uniform float uThermalSpeed;
    uniform float uBorderFlowSpeed;
    uniform float uBorderIntensity;
    
    // Apple thermal gradient colors
    uniform float3 uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uColor7;
    uniform float4 uBlend, uFade, uMaxBlend;
    
    uniform float uEffectIntensity;
    uniform float uColorSaturation;
    uniform float uGradientShift;
    uniform float uAmount;
    
    // Convert RGB to luminance for saturation adjustment
    float3 linearRgbToLuminance(float3 c) {
      float f = dot(c, float3(0.2126729, 0.7151522, 0.0721750));
      return float3(f);
    }
    
    // Adjust color saturation
    float3 saturation(float3 c, float s) {
      return mix(linearRgbToLuminance(c), c, s);
    }
    
    float noise(float2 p) {
      return fract(sin(dot(p, float2(12.9898, 78.233))) * 43758.5453);
    }
    
    float smoothNoise(float2 p) {
      float2 i = floor(p);
      float2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = noise(i);
      float b = noise(i + float2(1.0, 0.0));
      float c = noise(i + float2(0.0, 1.0));
      float d = noise(i + float2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    float3 gradient(float t) {
      t = clamp(t + uGradientShift, 0.0, 1.0);
      
      float p1 = uBlend.x, p2 = uBlend.y, p3 = uBlend.z, p4 = uBlend.w;
      float p5 = uMaxBlend.x, p6 = uMaxBlend.y;
      float f1 = uFade.x, f2 = uFade.y, f3 = uFade.z, f4 = uFade.w;
      float f5 = uMaxBlend.z, f6 = uMaxBlend.w;
      
      float b1 = smoothstep(p1 - f1 * 0.5, p1 + f1 * 0.5, t);
      float b2 = smoothstep(p2 - f2 * 0.5, p2 + f2 * 0.5, t);
      float b3 = smoothstep(p3 - f3 * 0.5, p3 + f3 * 0.5, t);
      float b4 = smoothstep(p4 - f4 * 0.5, p4 + f4 * 0.5, t);
      float b5 = smoothstep(p5 - f5 * 0.5, p5 + f5 * 0.5, t);
      float b6 = smoothstep(p6 - f6 * 0.5, p6 + f6 * 0.5, t);
      
      float3 col = uColor1;
      col = mix(col, uColor2, b1);
      col = mix(col, uColor3, b2);
      col = mix(col, uColor4, b3);
      col = mix(col, uColor5, b4);
      col = mix(col, uColor6, b5);
      col = mix(col, uColor7, b6);
      
      return col;
    }
    
    // Create search icon shape as a distance field
    float searchIconSDF(float2 uv) {
      float2 center = float2(0.5, 0.5);
      
      // Magnifying glass circle
      float2 circleCenter = center - float2(0.08, 0.08);
      float circleRadius = 0.22;
      float circleDist = length(uv - circleCenter) - circleRadius;
      float circleRing = abs(circleDist) - 0.05; // Ring thickness
      
      // Handle line - shorter and thicker
      float2 handleStart = center + float2(0.08, 0.08);
      float2 handleEnd = center + float2(0.28, 0.28); // Shorter handle (reduced from 0.35)
      float2 handleDir = normalize(handleEnd - handleStart);
      float2 toStart = uv - handleStart;
      float handleProjection = clamp(dot(toStart, handleDir), 0.0, length(handleEnd - handleStart));
      float2 closestPoint = handleStart + handleProjection * handleDir;
      float handleDist = length(uv - closestPoint) - 0.055; // Thicker handle (increased from 0.045)
      
      // Combine shapes
      return min(circleRing, handleDist);
    }
    
    half4 main(float2 coord) {
      float2 uv = coord / uResolution;
      
      // Get search icon mask
      float iconSDF = searchIconSDF(uv);
      float iconMask = 1.0 - smoothstep(0.0, 0.02, iconSDF);
      
      // Early exit if completely outside icon
      if (iconMask < 0.01) {
        return half4(0.0, 0.0, 0.0, 0.0);
      }
      
      // Time-based flow offset
      float flowOffset = uTime * uThermalSpeed * 2.0;
      
      // Background thermal map from noise
      float heatWave = smoothNoise(float2(uv.x * 8.0, uv.y * 10.0 - flowOffset));
      float map = pow(heatWave, 1.5);
      
      // Add flowing thermal animation along icon edges
      float edgeDistance = abs(iconSDF);
      float heatZone = 1.0 - smoothstep(0.0, 0.1, edgeDistance);
      
      if (heatZone > 0.01) {
        float flowTime = uTime * uBorderFlowSpeed * 10.0;
        float wave1 = sin((uv.y * 12.0) - flowTime) * 0.5 + 0.5;
        float wave2 = sin((uv.x * 8.0) - flowTime * 1.3 + uv.y * 2.0) * 0.5 + 0.5;
        float wave3 = sin((uv.y * 15.0) - flowTime * 0.7) * 0.5 + 0.5;
        
        float combinedWave = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
        float turbulence = smoothNoise(float2(uv.x * 8.0, uv.y * 10.0 - flowTime * 0.5));
        combinedWave = mix(combinedWave, turbulence, 0.4);
        
        float thermalPulse = pow(combinedWave, 2.0);
        map = map + thermalPulse * heatZone * uBorderIntensity * 0.7;
      }
      
      // Apply vertical gradient mask for more interesting heat distribution
      float msk = smoothstep(0.2, 0.8, uv.y);
      map = mix(map * 0.91, map, msk);
      map = mix(0.0, map, uAmount);
      
      // Apply circular fade from center
      float fade = distance(uv, float2(0.5, 0.5));
      fade = smoothstep(0.5, 0.7, 1.0 - fade);
      
      float3 finalColor = gradient(map);
      finalColor = saturation(finalColor, uColorSaturation);
      finalColor *= fade;
      finalColor = mix(float3(0.0), finalColor, uAmount * uEffectIntensity);
      
      // Apply icon mask to final color output
      finalColor = mix(float3(0.0), finalColor, iconMask);
      
      return half4(finalColor, iconMask);
    }
  `)!;

  useFrameCallback((frameInfo) => {
    time.value = frameInfo.timestamp / 1000;
  });

  const thermalUniforms = useDerivedValue(() => {
    return {
      uResolution: [size, size],
      uTime: time.value,
      uBackgroundHeatIntensity: backgroundHeatIntensity,
      uThermalSpeed: thermalSpeed,
      uBorderFlowSpeed: borderFlowSpeed,
      uBorderIntensity: borderIntensity,
      ...thermalColors,
      uBlend: [0.4, 0.7, 0.81, 0.91],
      uFade: [1, 1, 0.72, 0.52],
      uMaxBlend: [0.8, 0.87, 0.5, 0.27],
      uEffectIntensity: 1.0,
      uColorSaturation: 1.3,
      uGradientShift: 0.0,
      uAmount: 1.0,
    };
  });

  return (
    <Canvas
      style={{
        width: size,
        height: size,
      }}>
      {thermalShader && (
        <Fill>
          <Shader source={thermalShader} uniforms={thermalUniforms} />
        </Fill>
      )}
    </Canvas>
  );
}
