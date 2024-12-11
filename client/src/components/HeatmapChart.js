import React from 'react';
import ReactApexChart from 'react-apexcharts';

const HeatmapChart = ({ data }) => {
  // Преобразуем одномерный массив в двумерный 16x32
  const transformData = () => {
    const rows = 16;
    const cols = 32;
    let transformedData = [];
    
    for (let i = 0; i < rows; i++) {
      let row = [];
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        row.push({
          x: j,
          y: data[index]
        });
      }
      transformedData.push({
        name: ``,
        data: row
      });
    }
    return transformedData;
  };

  const options = {
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    colors: ["#008FFB"],
    title: {
      text: 'Vector Visualization',
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333'
      }
    },
    plotOptions: {
      heatmap: {
        enableShades: true,
        shadeIntensity: 0.7,
        distributed: true,
        inverse: true,
        colorScale: {
          inverse: true,
          min: -1000,
          max: 1000,
          ranges: [{
            from: -4,
            to: 4,
            color: '#7F55DA'
          }]
        }
      }
    },
    theme: {
      mode: 'light'
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <ReactApexChart
        options={options}
        series={transformData()}
        type="heatmap"
        height="100%"
      />
    </div>
  );
};

export default HeatmapChart;
