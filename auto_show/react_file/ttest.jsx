// 正确导入组件
import { Canvas } from '@react-three/fiber'; // 必须显式导入[8](@ref)
import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables); // 注册Chart.js组件[4](@ref)

const RLAnimation = () => {
  const [socket, setSocket] = useState(null);
  const [animationData, setAnimationData] = useState({
    states: [],
    rewards: []
  });
  const ws = useRef(null);

  useEffect(() => {
    const newWs = new WebSocket('http://127.0.0.1:5000/ws-rl');
    ws.current = newWs;

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAnimationData(prev => ({
        states: [...prev.states.slice(-50), data.state],
        rewards: [...prev.rewards.slice(-50), data.reward]
      }));
    };

    setSocket(newWs);
    return () => newWs.close();
  }, []);

  // 2D图表渲染
  const chartData = {
    labels: animationData.states.map((_,i) => i),
    datasets: [
      { label: '状态值', data: animationData.states, borderColor: 'rgb(75, 192, 192)' },
      { label: '奖励值', data: animationData.rewards, borderColor: 'rgb(255, 99, 132)' }
    ]
  };

  // 3D环境渲染
  const render3DEnv = () => (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh position={animationData.states.slice(-1)[0] || [0,0,0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  );

  return (
    <div className="animation-container">
      <h2>强化学习过程实时可视化</h2>
      <div className="chart-panel">
        <Line data={chartData} options={{ 
          animation: false,
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }} />
      </div>
      <div className="3d-view">
        {render3DEnv()}
      </div>
    </div>
  );
};

export default RLAnimation;