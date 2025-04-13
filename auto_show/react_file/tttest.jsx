// 正确导入组件
import React, { useEffect, useState, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { io } from 'socket.io-client'; // 使用socket.io客户端库[3,6](@ref)

import { Canvas } from '@react-three/fiber'; // 必须显式导入[8](@ref)
// import React, { useState, useEffect, useRef } from 'react';
// import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables); // 注册Chart.js组件[4](@ref)

const RLAnimation = () => {
  const [animationData, setAnimationData] = useState({
    states: [],
    rewards: [],
    actions: []
  });
  const socketRef = useRef(null);

  useEffect(() => {
    // 创建Socket.io连接（与Flask-SocketIO兼容）
    socketRef.current = io('http://127.0.0.1:5000', {
      path: '/ws-rl',      // 对应Flask路由路径
      transports: ['websocket'], // 强制使用WebSocket协议[3](@ref)
      reconnection: true,  // 开启自动重连[4](@ref)
      reconnectionDelay: 1000 // 重连间隔1秒
    });

    // 事件监听配置
    socketRef.current.on('connect', () => {
      console.log('Socket连接成功，ID:', socketRef.current.id);
    });

    socketRef.current.on('rl_update', (data) => { // 监听服务端事件[6,8](@ref)
        console.log(data.action);
      setAnimationData(prev => ({
        states: [...prev.states.slice(-50), data.state],
        rewards: [...prev.rewards.slice(-50), data.reward],
        actions: [...prev.actions.slice(-50), data.action]
      }));
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket连接断开');
    });

    // 组件卸载时清理
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
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