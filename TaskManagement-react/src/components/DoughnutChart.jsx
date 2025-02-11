import React, {useEffect,useState} from 'react'
import { ResponsivePie } from "@nivo/pie";
import axios from 'axios';
import { API_BASE_URL } from '/src/config.js';

const DoughnutChart = () => {

const [totalDuration,setTotalDuration] = useState([]);
const [loading, setLoading] = useState(true);

const generateRandomColor = () => {
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let colorValue = Math.floor(Math.random() * 76) + 180; 
      color += colorValue.toString(16).padStart(2, '0'); 
    }
    return color;
  };

useEffect(() => {
    axios.get(`${API_BASE_URL}/api/getTotalTimeByCategory`).then((response) => {

        const totalTime = response.data.reduce((sum, item) => sum + Number(item.TotalDuracion), 0);
        const dataPercent = response.data.map((item) => ({
          id: item.nombre_categoria,
          label: item.nombre_categoria,
          value: parseFloat(((Number(item.TotalDuracion) / totalTime) * 100).toFixed(0)), 
          color: generateRandomColor(),
        }));
        
        setTotalDuration(dataPercent);
      })
      .catch((error) => {
        console.error('Error al cargar los timers totales por categoria:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Cargando...</div>; 
  }
 
  return (
    <div style={{ height: "400px" }}>
    <ResponsivePie
      data={totalDuration}
      margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      colors={{ datum: "data.color" }}
      borderWidth={1}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      radialLabelsSkipAngle={10}
      radialLabelsTextColor="#333333"
      radialLabelsLinkColor={{ from: "color" }}
      sliceLabelsSkipAngle={20}
      sliceLabelsTextColor="#333333"
    />
  </div>
  )
}

export default DoughnutChart