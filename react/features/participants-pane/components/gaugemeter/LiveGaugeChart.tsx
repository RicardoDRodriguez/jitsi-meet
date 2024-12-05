import React, { useState, useEffect } from "react";
import GaugeChart from 'react-gauge-chart';
import DataBaseForGauge from '././DataBaseForGauge';
import { withPixelLineHeight } from "../../../base/styles/functions.web";
import { makeStyles } from 'tss-react/mui';

const chartStyle: React.CSSProperties = {
  height: 10
};

interface LiveGaugeChartProps {
//  database: DataBaseForGauge;
}


const LiveGaugeChart: React.FC<LiveGaugeChartProps> = ({ }) => {

  const [value, setValue] = useState<number>(0.0); // Initial value
  const database = new DataBaseForGauge();

  // Simulate live data updates     
  useEffect(() => {
    const fetchValue = async () => {
      let newValue = await database.calcularGini();
      console.log("=== New Value: ", newValue);

      if (Number.isNaN(newValue)) {
        newValue = 0.0;
      } else if (newValue < 0) {
        newValue = 0;
      } else if (newValue > 1) {
        newValue = 1;
      }

      setValue(newValue);
    };

    fetchValue(); // Fetch initial value

    const interval = setInterval(fetchValue, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [database]);

  return (
    <div>
      <GaugeChart
        id="gauge-chart1"
        style={chartStyle}
        animate={false}
        arcsLength={[0.1, 0.1, 0.1, 0.4, 0.3]}
        colors={["#E4080A", "#FF9101", "#FFDE59", "#7DDA58", "#5DE2E7"]}
        percent={value}
        arcPadding={0.00}
        textColor="#FFFFFF"
        needleColor="#FFFFFF" // Cor do ponteiro
        formatTextValue={(value: string): string => `${parseFloat(value).toFixed(1)}%`}
      />
    </div>
    
  );
};

export default LiveGaugeChart;
