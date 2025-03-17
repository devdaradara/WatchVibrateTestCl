import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="home-page">
      <div className="container">
        <h1>갤럭시 워치 진동 컨트롤러</h1>
        <p className="subtitle">스마트폰에서 갤럭시 워치의 진동을 제어하는 앱</p>
        
        <div className="device-selection">
          <h2>디바이스를 선택하세요</h2>
          <div className="device-buttons">
            <button 
              className="device-button phone-button"
              onClick={() => navigate('/phone')}
            >
              <div className="icon">📱</div>
              <span>스마트폰</span>
              <small>워치에 진동 명령 보내기</small>
            </button>
            <button 
              className="device-button watch-button"
              onClick={() => navigate('/watch')}
            >
              <div className="icon">⌚</div>
              <span>갤럭시 워치</span>
              <small>진동 명령 받기</small>
            </button>
          </div>
        </div>
        
        <div className="instructions">
          <h3>사용 방법</h3>
          <ol>
            <li>갤럭시 워치에서 <strong>워치 모드</strong>를 실행하세요.</li>
            <li>스마트폰에서 <strong>스마트폰 모드</strong>를 실행하세요.</li>
            <li>스마트폰에서 워치로 진동 명령을 보낼 수 있습니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default HomePage;