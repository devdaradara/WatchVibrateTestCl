import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/WatchApp.css';

// 나중에 실제 서버 URL로 대체할 예정
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// 진동 패턴 정의
const vibrationPatterns = {
  default: [200, 100, 200],
  sos: [100, 100, 100, 100, 100, 300, 200, 300, 100, 100, 100],
  heartbeat: [100, 200, 100, 600],
  notification: [80, 50, 80, 50, 160],
  alarm: [200, 100, 200, 100, 200, 100, 600]
};

function WatchApp() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('개발 모드: 서버 연결 없음');
  const [lastCommand, setLastCommand] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [vibSupported, setVibSupported] = useState(true);
  const vibrationIntervalRef = useRef(null);
  
  // 브라우저 진동 지원 확인
  useEffect(() => {
    if (!window.navigator || !window.navigator.vibrate) {
      setVibSupported(false);
      setStatus('이 기기는 진동 API를 지원하지 않습니다');
    }
  }, []);
  
  // 소켓 연결 초기화 (실제 배포 시 활성화)
  /*
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    
    newSocket.on('connect', () => {
      setConnected(true);
      setStatus('서버에 연결됨');
      
      // 워치로 등록
      newSocket.emit('register', { deviceType: 'watch' });
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
      setStatus('서버 연결 끊김');
    });
    
    newSocket.on('executeVibration', (command) => {
      executeVibration(command);
    });
    
    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(0);
      }
      newSocket.disconnect();
    };
  }, []);
  */
  
  // 메모리 누수 방지를 위한 정리
  useEffect(() => {
    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(0);
      }
    };
  }, []);
  
  // 진동 실행 함수
  const executeVibration = (command) => {
    if (!vibSupported) {
      setStatus('이 기기는 진동 API를 지원하지 않습니다');
      return;
    }
    
    // 이전 진동 중지
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    window.navigator.vibrate(0);
    
    setLastCommand(command);
    
    // 명령에 따라 진동 실행
    switch(command.type) {
      case 'single':
        window.navigator.vibrate(300);
        setStatus('단일 진동 실행 중');
        break;
        
      case 'pattern':
        window.navigator.vibrate(vibrationPatterns[command.pattern]);
        setStatus(`${command.pattern} 패턴 실행 중`);
        break;
        
      case 'repeated':
        const pattern = vibrationPatterns[command.pattern];
        window.navigator.vibrate(pattern);
        
        vibrationIntervalRef.current = setInterval(() => {
          window.navigator.vibrate(pattern);
        }, 1500); // 패턴 사이에 약간의 간격
        
        setStatus(`${command.pattern} 패턴 반복 실행 중`);
        break;
        
      case 'stop':
        setStatus('진동 중지됨');
        break;
        
      default:
        setStatus('알 수 없는 명령');
    }
  };
  
  // 테스트 모드에서 진동 테스트
  const testVibration = (type) => {
    const command = {
      type: type,
      pattern: 'default'
    };
    
    executeVibration(command);
  };
  
  return (
    <div className="watch-app">
      <div className="watch-container">
        <div className="watch-header">
          <Link to="/" className="back-link">
            ←
          </Link>
          <div className="title">워치 모드</div>
          <button 
            className="test-toggle"
            onClick={() => setTestMode(!testMode)}
          >
            {testMode ? '✓' : '⚙️'}
          </button>
        </div>
        
        <div className="watch-content">
          {!testMode ? (
            // 일반 모드 - 상태 표시
            <div className="status-display">
              <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? '연결됨' : '연결 안됨'}
              </div>
              
              <div className="status-message">
                {status}
              </div>
              
              {lastCommand && (
                <div className="command-display">
                  <div className="command-type">
                    {lastCommand.type === 'single' && '단일 진동'}
                    {lastCommand.type === 'pattern' && '패턴 진동'}
                    {lastCommand.type === 'repeated' && '반복 진동'}
                    {lastCommand.type === 'stop' && '중지'}
                  </div>
                  {lastCommand.pattern && lastCommand.type !== 'stop' && (
                    <div className="command-pattern">
                      {lastCommand.pattern === 'default' && '기본 패턴'}
                      {lastCommand.pattern === 'sos' && 'SOS'}
                      {lastCommand.pattern === 'heartbeat' && '심장박동'}
                      {lastCommand.pattern === 'notification' && '알림'}
                      {lastCommand.pattern === 'alarm' && '알람'}
                    </div>
                  )}
                </div>
              )}
              
              {!vibSupported && (
                <div className="error-message">
                  이 기기는 진동을 지원하지 않습니다
                </div>
              )}
              
              <div className="instruction">
                스마트폰에서 보낸 진동 명령이 여기에 표시됩니다
              </div>
            </div>
          ) : (
            // 테스트 모드 - 진동 테스트 컨트롤
            <div className="test-controls">
              <div className="test-title">진동 테스트</div>
              <div className="test-buttons">
                <button 
                  className="test-button"
                  onClick={() => testVibration('single')}
                  disabled={!vibSupported}
                >
                  단일
                </button>
                <button 
                  className="test-button"
                  onClick={() => testVibration('pattern')}
                  disabled={!vibSupported}
                >
                  패턴
                </button>
                <button 
                  className="test-button"
                  onClick={() => testVibration('repeated')}
                  disabled={!vibSupported}
                >
                  반복
                </button>
                <button 
                  className="test-button stop"
                  onClick={() => testVibration('stop')}
                  disabled={!vibSupported}
                >
                  중지
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WatchApp;