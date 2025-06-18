declare module "react-native-svg-charts" {
  import { ViewStyle } from "react-native";

  interface PieChartProps {
    data: {
      value: number;
      svg: { fill: string };
      key: string;
      arc?: { cornerRadius?: number };
    }[];
    style?: ViewStyle;
    innerRadius?: string | number;
    padAngle?: number;
  }

  export class PieChart extends React.Component<PieChartProps> {}
}
