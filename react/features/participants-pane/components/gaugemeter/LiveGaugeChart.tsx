import React, { useState, useEffect } from "react";
import GaugeChart from 'react-gauge-chart';
import dataBaseForGauge from '././DataBaseForGauge';

const chartStyle: React.CSSProperties = {
  height: 10
};

interface LiveGaugeChartProps {
  // database: DataBaseForGauge;
}

const LiveGaugeChart: React.FC<LiveGaugeChartProps> = () => {
  const [value, setValue] = useState<number>(0.0); // Initial value
  
  // Simulate live data updates     
  useEffect(() => {
    const fetchValue = async () => {
      let newValue = await dataBaseForGauge.calcularGini();
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
    
    const interval = setInterval(fetchValue, 1000); // Update every 1 seconds

    return () => clearInterval(interval);
  }, []);

  const formattedValue = `${parseFloat((value*100).toString()).toFixed(1)}%`;

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
        hideText={true}
      />
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, fontSize: '14px', color: '#FFFFFF' }}> 
        {formattedValue}
      </div>
    </div>
  );
};

export default LiveGaugeChart;
