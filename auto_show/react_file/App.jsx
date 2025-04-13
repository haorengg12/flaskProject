import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import SettingsLogo from './assets/settings.svg';
import AgentEditor from './components/AgentEditor/AgentEditor.jsx';
import TrainingService from './components/TrainingService/TrainingService.jsx';
import ModelManagement from './components/ModelManage/ModelManagement.jsx';
import EvaluationOptimization from "./components/EvaluationOptimization/EvaluationOptimization.jsx";
import RLAnimation from "./components/tttest.jsx"
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('');

  const tabs = [
    { name: '智能体编辑', path: '/智能体编辑' },
    { name: '训练服务', path: '/训练服务' },
    { name: '评估与优化', path: '/评估与优化' },
    { name: '模型管理', path: '/模型管理' },
  ];

  return (
      <Router>
        <div className="app-container">
          <header className="app-header">
            <div className="header-left">
              <HomeLink />
            </div>
            <div className="header-right">
              <span className="settings-text">设置</span>
              <button className="settings-button">
                <img src={SettingsLogo} alt="Settings" className="settings-icon" />
              </button>
            </div>
          </header>
          <nav className="app-nav">
            {tabs.map((tab, index) => (
                <div key={tab.name} className="nav-item">
                  <NavLink
                      to={tab.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.name)}
                  >
                    {tab.name}
                  </NavLink>
                  {index < tabs.length - 1 && <div className="divider"></div>}
                </div>
            ))}
          </nav>
          <Routes>
            <Route path="/智能体编辑" element={<RLAnimation />} />
            <Route path="/训练服务" element={<TrainingService />} />
            <Route path="/评估与优化" element={<EvaluationOptimization />} />
            <Route path="/模型管理" element={<ModelManagement />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
  );
}

function HomeLink() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
      <div onClick={handleClick} className="home-link">
        <img src={reactLogo} alt="React" className="logo-icon" />
        <div className="logo-text">
          <h1 className="main-title">智能体建模软件</h1>
          <h1 className="sub-title">v1.0</h1>
        </div>
      </div>
  );
}

function HomePage() {
  return <div>首页</div>;
}

export default App;