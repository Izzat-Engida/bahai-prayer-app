import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect,
} from "react-native-svg";

export type ArtType =
  | "flower"
  | "sunrise"
  | "moon"
  | "book"
  | "leaf"
  | "star"
  | "community"
  | "candle"
  | "shield"
  | "hands"
  | "dove"
  | "fountain"
  | "tree"
  | "fire"
  | "ring"
  | "flag";

type Props = {
  type: ArtType;
  color: string;
  accent: string;
};

const getStarPoints = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points = 9
) => {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;

    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
};

export default function CategoryIllustration({
  type,
  color,
  accent,
}: Props) {
  return (
    <View style={styles.container}>
      <Svg width="150" height="145" viewBox="0 0 150 145">
      
        <Circle
          cx="75"
          cy="70"
          r="57"
          fill={color}
          opacity={0.55}
        />

        <Circle
          cx="75"
          cy="70"
          r="43"
          fill="none"
          stroke={accent}
          strokeWidth="1"
          strokeDasharray="2 5"
          opacity={0.35}
        />

      
        {type === "flower" && (
          <G>
            {Array.from({ length: 8 }).map((_, i) => (
              <Ellipse
                key={i}
                cx="75"
                cy="45"
                rx="11"
                ry="24"
                fill={accent}
                opacity={0.8}
                transform={`rotate(${i * 45} 75 70)`}
              />
            ))}
            <Circle cx="75" cy="70" r="14" fill="#C5A059" />
            <Circle cx="75" cy="70" r="5" fill="#F9F6F0" />
            <Path
              d="M75 85 C73 101 80 111 75 125"
              stroke="#66836B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M75 105 C57 88 48 101 61 109 C67 112 72 110 75 105Z"
              fill="#66836B"
            />
            <Path
              d="M77 115 C93 99 104 111 91 119 C85 122 80 120 77 115Z"
              fill="#8AA184"
            />
          </G>
        )}

       
        {type === "sunrise" && (
          <G>
            {[-60, -30, 0, 30, 60].map((rotation) => (
              <Line
                key={rotation}
                x1="75"
                y1="40"
                x2="75"
                y2="31"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${rotation} 75 76)`}
              />
            ))}
            <Path
              d="M47 79 A28 28 0 0 1 103 79Z"
              fill="#C5A059"
            />
            <Path
              d="M28 82 Q75 74 122 82"
              stroke={accent}
              strokeWidth="1.5"
              fill="none"
            />
            <Path
              d="M22 101 Q49 75 76 98 Q99 78 128 100 L128 116 L22 116Z"
              fill="#66836B"
              opacity={0.8}
            />
            <Path
              d="M22 109 Q54 91 83 107 Q106 94 128 108 L128 119 L22 119Z"
              fill="#8AA184"
            />
            <Circle cx="75" cy="86" r="2.5" fill="#F9F6F0" />
          </G>
        )}

       
        {type === "moon" && (
          <G>
            <Path
              d="M85 40 C62 40 45 57 45 80 C45 103 62 120 85 120 C73 112 66 98 66 80 C66 62 73 48 85 40Z"
              fill="#C5A059"
            />
            <Circle cx="102" cy="52" r="3" fill={accent} opacity={0.9} />
            <Circle cx="112" cy="72" r="2" fill={accent} opacity={0.7} />
            <Circle cx="42" cy="52" r="2" fill={accent} opacity={0.8} />
            <Path
              d="M32 105 Q55 92 78 105 Q101 92 124 105 L124 118 L32 118Z"
              fill="#66836B"
              opacity={0.4}
            />
          </G>
        )}

      
        {type === "book" && (
          <G>
            <Path
              d="M75 52 C58 40 39 43 32 49 L32 101 C48 94 63 98 75 109Z"
              fill="#FFFFFF"
              stroke={accent}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <Path
              d="M75 52 C92 40 111 43 118 49 L118 101 C102 94 87 98 75 109Z"
              fill="#FFFFFF"
              stroke={accent}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <Path
              d="M75 53 L75 108"
              stroke="#C5A059"
              strokeWidth="2"
            />
            {[0, 1, 2].map((i) => (
              <G key={i}>
                <Line
                  x1="43"
                  y1={63 + i * 11}
                  x2="65"
                  y2={63 + i * 11}
                  stroke="#B7B1A6"
                  strokeWidth="1.5"
                />
                <Line
                  x1="85"
                  y1={63 + i * 11}
                  x2="107"
                  y2={63 + i * 11}
                  stroke="#B7B1A6"
                  strokeWidth="1.5"
                />
              </G>
            ))}
          </G>
        )}

      
        {type === "leaf" && (
          <G>
            <Path
              d="M45 108 C44 65 72 36 112 35 C113 74 91 109 45 108Z"
              fill="#66836B"
            />
            <Path
              d="M45 108 Q72 76 105 43"
              stroke="#F9F6F0"
              strokeWidth="2"
              fill="none"
            />
            <Path
              d="M68 83 Q64 63 51 61 M82 69 Q100 68 105 58 M59 95 Q76 94 83 83"
              stroke="#C5D9C0"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="45" cy="108" r="4" fill="#C5A059" />
          </G>
        )}

      
        {type === "star" && (
          <G>
            <Circle
              cx="75"
              cy="70"
              r="39"
              fill="none"
              stroke={accent}
              strokeWidth="1"
              opacity={0.45}
            />
            <Polygon
              points={getStarPoints(75, 70, 37, 25, 9)}
              fill="#C5A059"
              stroke={accent}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <Circle
              cx="75"
              cy="70"
              r="17"
              fill={color}
              stroke={accent}
              strokeWidth="1.5"
            />
            <Circle cx="75" cy="70" r="7" fill="#C5A059" />
            {Array.from({ length: 9 }).map((_, i) => {
              const angle = (i * 2 * Math.PI) / 9 - Math.PI / 2;
              return (
                <Circle
                  key={i}
                  cx={75 + Math.cos(angle) * 48}
                  cy={70 + Math.sin(angle) * 48}
                  r="1.8"
                  fill={accent}
                />
              );
            })}
          </G>
        )}

       
        {type === "community" && (
          <G>
            <Circle cx="75" cy="51" r="11" fill="#C5A059" />
            <Path
              d="M54 105 Q55 72 75 72 Q95 72 96 105Z"
              fill="#C5A059"
            />
            <Circle cx="45" cy="65" r="9" fill={accent} />
            <Path
              d="M27 106 Q28 82 45 82 Q59 82 64 99 L64 106Z"
              fill={accent}
            />
            <Circle cx="105" cy="65" r="9" fill={accent} />
            <Path
              d="M86 99 Q91 82 105 82 Q122 82 123 106 L86 106Z"
              fill={accent}
            />
            <Path
              d="M43 117 Q75 129 107 117"
              stroke="#C5A059"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </G>
        )}

        
        {type === "candle" && (
          <G>
            
            <Rect
              x="63"
              y="68"
              width="24"
              height="44"
              rx="4"
              fill="#FFFFFF"
              stroke={accent}
              strokeWidth="1.5"
            />
            <Line
              x1="75"
              y1="68"
              x2="75"
              y2="58"
              stroke={accent}
              strokeWidth="2"
            />
            
            <Path
              d="M75 34 C64 45 64 54 75 58 C86 54 86 45 75 34Z"
              fill="#C5A059"
              opacity={0.9}
            />
            
            <Path
              d="M75 42 C70 48 70 53 75 56 C80 53 80 48 75 42Z"
              fill="#FFF4D0"
            />
            
            <Path
              d="M50 112 L100 112 Q100 118 75 118 Q50 118 50 112Z"
              fill={accent}
            />
          </G>
        )}

        
        {type === "shield" && (
          <G>
            <Path
              d="M75 38 L110 50 C110 85 92 110 75 118 C58 110 40 85 40 50 Z"
              fill="#FFFFFF"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <Path
              d="M75 45 L102 55 C102 82 87 103 75 110 C63 103 48 82 48 55 Z"
              fill={color}
              opacity={0.6}
            />
            <Polygon
              points={getStarPoints(75, 75, 14, 8, 9)}
              fill="#C5A059"
            />
          </G>
        )}

        
        {type === "hands" && (
          <G>
            
            <Path
              d="M32 95 C38 82 55 76 68 84 L72 98 C56 94 44 98 38 112 Z"
              fill={accent}
            />
       
            <Path
              d="M118 95 C112 82 95 76 82 84 L78 98 C94 94 106 98 112 112 Z"
              fill={accent}
            />
        
            <Circle cx="75" cy="58" r="16" fill="#C5A059" />
            <Circle cx="75" cy="58" r="8" fill="#FFF4D0" />
            {[-45, 0, 45].map((angle) => (
              <Line
                key={angle}
                x1="75"
                y1="34"
                x2="75"
                y2="26"
                stroke="#C5A059"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${angle} 75 58)`}
              />
            ))}
          </G>
        )}

       
        {type === "dove" && (
          <G>
           
            <Path
              d="M40 75 Q60 40 92 48 Q118 54 112 75 Q102 92 78 88 Q55 98 40 75 Z"
              fill="#FFFFFF"
              stroke={accent}
              strokeWidth="2"
              strokeLinejoin="round"
            />
           
            <Path
              d="M68 62 C58 35 85 30 102 38 Z"
              fill={accent}
              opacity={0.85}
            />
          
            <Path
              d="M112 70 Q124 64 128 66 Q122 72 112 72"
              stroke="#66836B"
              strokeWidth="2"
              fill="none"
            />
            <Circle cx="106" cy="62" r="2" fill="#4A463D" />
          </G>
        )}


        {type === "fountain" && (
          <G>
        
            <Ellipse cx="75" cy="98" rx="38" ry="12" fill={accent} />
            <Rect x="71" y="68" width="8" height="30" fill={accent} />
            <Ellipse cx="75" cy="68" rx="22" ry="7" fill="#C5A059" />
            
            <Path
              d="M75 68 Q60 38 48 56"
              stroke="#627FAD"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M75 68 Q90 38 102 56"
              stroke="#627FAD"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M75 68 Q75 30 75 42"
              stroke="#627FAD"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="48" cy="58" r="2" fill="#627FAD" />
            <Circle cx="102" cy="58" r="2" fill="#627FAD" />
          </G>
        )}

        
        {type === "tree" && (
          <G>
            
            <Path
              d="M70 85 L70 115 M80 85 L80 115"
              stroke="#B47D45"
              strokeWidth="4"
              strokeLinecap="round"
            />
    
            <Circle cx="75" cy="58" r="26" fill="#66836B" />
            <Circle cx="56" cy="68" r="18" fill="#8AA184" />
            <Circle cx="94" cy="68" r="18" fill="#8AA184" />
            <Circle cx="75" cy="48" r="16" fill="#C5D9C0" opacity={0.6} />
          </G>
        )}

    
        {type === "fire" && (
          <G>
            
            <Path
              d="M75 32 C50 62 50 95 75 112 C100 95 100 62 75 32Z"
              fill="#B47D45"
              opacity={0.85}
            />
            
            <Path
              d="M75 48 C60 70 60 92 75 105 C90 92 90 70 75 48Z"
              fill="#C5A059"
            />
            
            <Path
              d="M75 68 C68 80 68 92 75 100 C82 92 82 80 75 68Z"
              fill="#FFF4D0"
            />
          </G>
        )}

       
        {type === "ring" && (
          <G>
           
            <Circle
              cx="62"
              cy="75"
              r="24"
              fill="none"
              stroke="#C5A059"
              strokeWidth="4.5"
            />
            
            <Circle
              cx="88"
              cy="75"
              r="24"
              fill="none"
              stroke={accent}
              strokeWidth="4.5"
            />
            
            <Polygon
              points="62,44 65,49 70,52 65,55 62,60 59,55 54,52 59,49"
              fill="#FFF4D0"
            />
          </G>
        )}

        
        {type === "flag" && (
          <G>
            
            <Line
              x1="48"
              y1="34"
              x2="48"
              y2="118"
              stroke={accent}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
           
            <Circle cx="48" cy="32" r="4.5" fill="#C5A059" />
            
            <Path
              d="M48 38 Q72 26 96 40 Q116 50 125 40 L125 82 Q105 92 86 78 Q68 68 48 80 Z"
              fill={accent}
            />
            <Path
              d="M48 48 Q72 36 96 50 Q116 60 125 50 L125 72 Q105 82 86 68 Q68 58 48 70 Z"
              fill="#C5A059"
              opacity={0.85}
            />
            
            <Polygon
              points={getStarPoints(84, 60, 8, 4, 9)}
              fill="#FFFFFF"
            />
           
            <Path
              d="M36 118 L60 118"
              stroke={accent}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 145,
    alignItems: "center",
    justifyContent: "center",
  },
});
