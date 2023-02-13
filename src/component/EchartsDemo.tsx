import * as echarts from "echarts";
import { useRef, useEffect } from "react";
interface Props {
  demo: number;
}
const demoOptions = [
  {
    legend: {
      show: true,
      top: "3%",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
      },
    ],
  },
  {
    legend: {},
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  },
  {
    legend: {},
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 1048, name: "Search Engine" },
          { value: 735, name: "Direct" },
          { value: 580, name: "Email" },
          { value: 484, name: "Union Ads" },
          { value: 300, name: "Video Ads" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  },
];

function EchartsDemo(props: Props) {
  console.log(props, demoOptions[props.demo]);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const e = echarts.init(container.current!, "dark");
    e.setOption(demoOptions[props.demo]);
    return () => {
      e.dispose();
    };
  }, []);
  return <div mt-10 w-150 h-100 ref={container}></div>;
}

export default EchartsDemo;
