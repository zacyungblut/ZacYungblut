import React from "react";
import { Canvas, Fill, Shader, Skia } from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  useFrameCallback,
} from "react-native-reanimated";

interface ThermalSegmentProps {
  width: number;
  height: number;
  intensity: number; // 0-1, where 0 is unselected (cool) and 1 is selected (hot)
  thermalSpeed?: number;
  borderFlowSpeed?: number;
  borderIntensity?: number;
}

export function ThermalSegment({
  width,
  height,
  intensity,
  thermalSpeed = 0.1,
  borderFlowSpeed = 0.4,
  borderIntensity = 1.1,
}: ThermalSegmentProps) {
  const time = useSharedValue(0);

  // Convert intensity prop to a shared value so it's reactive
  const intensityShared = useSharedValue(intensity);

  // Update the shared value whenever the prop changes
  React.useEffect(() => {
    intensityShared.value = intensity;
  }, [intensity, intensityShared]);

  // Pre-calculate thermal colors - changed black to light gray
  const thermalColors = React.useMemo(() => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return [r, g, b];
    };

    return {
      uColor1: hexToRgb("888888"), // Changed from "000000" (black) to light gray
      uColor2: hexToRgb("073dff"),
      uColor3: hexToRgb("53d5fd"),
      uColor4: hexToRgb("fefcdd"),
      uColor5: hexToRgb("ffec6a"),
      uColor6: hexToRgb("f9d400"),
      uColor7: hexToRgb("a61904"),
    };
  }, []);

  const thermalShader = Skia.RuntimeEffect.Make(`
    uniform float2 uResolution;
    uniform float uTime;
    uniform float uIntensity;
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
    
    // Create curved segment SDF - made thinner
    float curvedSegmentSDF(float2 uv, float2 size, float curvature) {
      // Center the UV coordinates
      float2 p = uv - 0.5;
      
      // Apply inverted curvature to make it curve inward toward the circle center
      float curve = -curvature * p.x * p.x; // Changed from positive to negative
      p.y += curve;
      
      // Create rounded rectangle with the curved coordinates - made thinner
      float2 d = abs(p) - (size * 0.5 - 0.1);
      float sdf = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.1;
      
      return sdf;
    }
    
    half4 main(float2 coord) {
      float2 uv = coord / uResolution;
      
      // Create curved segment shape - increased curvature for more pronounced arc
      float segmentSDF = curvedSegmentSDF(uv, float2(0.9, 0.5), 1.2); // Increased from 0.8 to 1.2
      float segmentMask = 1.0 - smoothstep(0.0, 0.03, segmentSDF);
      
      // Early exit if outside segment
      if (segmentMask < 0.01) {
        return half4(0.0, 0.0, 0.0, 0.0);
      }
      
      // Time-based flow offset
      float flowOffset = uTime * uThermalSpeed * 2.0;
      
      // Background thermal map from noise - adjusted for curved shape
      float heatWave = smoothNoise(float2(uv.x * 6.0, uv.y * 8.0 - flowOffset));
      float map = pow(heatWave, 1.5);
      
      // Add flowing thermal animation along segment edges
      float edgeDistance = abs(segmentSDF);
      float heatZone = 1.0 - smoothstep(0.0, 0.15, edgeDistance);
      
      if (heatZone > 0.01) {
        float flowTime = uTime * uBorderFlowSpeed * 10.0;
        float wave1 = sin((uv.y * 10.0) - flowTime) * 0.5 + 0.5;
        float wave2 = sin((uv.x * 6.0) - flowTime * 1.3 + uv.y * 2.0) * 0.5 + 0.5;
        float wave3 = sin((uv.y * 12.0) - flowTime * 0.7) * 0.5 + 0.5;
        
        float combinedWave = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
        float turbulence = smoothNoise(float2(uv.x * 6.0, uv.y * 8.0 - flowTime * 0.5));
        combinedWave = mix(combinedWave, turbulence, 0.4);
        
        float thermalPulse = pow(combinedWave, 2.0);
        map = map + thermalPulse * heatZone * uBorderIntensity * 0.7;
      }
      
      // Apply intensity-based thermal scaling
      // When intensity is 0, keep it cool (now light gray instead of black)
      // When intensity is 1, make it hot (bright thermal colors)
      map = mix(0.0, map, uIntensity);
      
      // Apply curved gradient mask for more interesting heat distribution
      float curveMask = smoothstep(0.1, 0.9, uv.x);
      map = mix(map * 0.91, map, curveMask);
      map = mix(0.0, map, uAmount);
      
      // Apply fade from edges for better visual effect
      float fade = 1.0 - smoothstep(0.7, 1.0, abs(uv.x - 0.5) * 2.0);
      fade *= 1.0 - smoothstep(0.6, 1.0, abs(uv.y - 0.5) * 2.0);
      
      float3 finalColor = gradient(map);
      finalColor = saturation(finalColor, uColorSaturation);
      finalColor *= fade;
      finalColor = mix(float3(0.0), finalColor, uAmount * uEffectIntensity);
      
      // Apply segment mask to final color output
      finalColor = mix(float3(0.0), finalColor, segmentMask);
      
      return half4(finalColor, segmentMask);
    }
  `)!;

  useFrameCallback((frameInfo) => {
    time.value = frameInfo.timestamp / 1000;
  });

  const thermalUniforms = useDerivedValue(() => {
    return {
      uResolution: [width, height],
      uTime: time.value,
      uIntensity: intensityShared.value, // Use the reactive shared value
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
        width: width,
        height: height,
      }}>
      {thermalShader && (
        <Fill>
          <Shader source={thermalShader} uniforms={thermalUniforms} />
        </Fill>
      )}
    </Canvas>
  );
}
