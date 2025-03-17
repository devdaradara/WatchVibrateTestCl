import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import '../styles/PhoneApp.css';

// 나중에 실제 서버 URL로 대체할 예정
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// 진동 패턴 옵션
const patternOptions = [
  { value: 'default', label: '기본 패턴' },
  { value: 'sos', label: 'SOS' },
  { value: 'heartbeat', label: '심장박동' },
  { value: 'notification', label: '알림' },
  { value: 'alarm', label: '알람' }
];

function PhoneApp() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('서버에 연결 중...');
  const [selectedPattern, setSelectedPattern] = useState('default');
  const [connectedWatches, setConnectedWatches] = useState([]);
  const [targetWatch, setTargetWatch] = useState('all');
  const [lastCommand, setLastCommand] = useState(null);
  
  // 소켓 연결 초기화
  useEffect(() => {
    // 실제 배포에서는 여기에 실제 서버 URL을 사용해야 함
    // 지금은 로컬 개발 중이므로 연결 가능한 서버가 없음을 표시
    setStatus('개발 모드: 서버 연결 없음');
    
    // 아래는 실제 서버 연결 코드 (실제 배포 시 활성화)
    /*
    const newSocket = io(SERVER_URL);
    
    newSocket.on('connect', () => {
      setConnected(true);
      setStatus('서버에 연결됨');
      
      // 스마트폰으로 등록
      newSocket.emit('register', { deviceType: 'phone' });
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
      setStatus('서버 연결 끊김');
      setConnectedWatches([]);
    });
    
    newSocket.on('watchesUpdated', (data) => {
      setConnectedWatches(data.connectedWatches);
      setStatus(`연결된 워치: ${data.connectedWatches.length}대`);
    });
    
    newSocket.on('commandError', (data) => {
      setStatus(`오류: ${data.message}`);
    });
    
    setSocket(newSocket);
    
    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      newSocket.disconnect();
    };
    */
  }, []);
  
  // 진동 명령 전송
  const sendCommand = (type) => {
    // 개발 모드에서는 로그만 출력
    console.log(`진동 명령 전송: ${type}, 패턴: ${selectedPattern}, 대상: ${targetWatch}`);
    
    // 마지막 명령 업데이트
    const command = { type, pattern: selectedPattern };
    setLastCommand(command);
    
    // 서버 연결 없이 상태 변경
    const target = targetWatch === 'all' ? '모든 워치' : `워치 ${targetWatch.substring(0, 6)}...`;
    setStatus(`${target}에 ${type} 명령 전송 (개발 모드)`);
    
    // 아래는 실제 서버 연결 코드 (실제 배포 시 활성화)
    /*
    if (!socket || !connected) {
      setStatus('서버에 연결되어 있지 않습니다.');
      return;
    }
    
    const command = {
      type,
      pattern: selectedPattern
    };
    
    socket.emit('vibrationCommand', {
      targetWatch,
      command
    });
    
    const target = targetWatch === 'all' ? '모든 워치' : `워치 ${targetWatch.substring(0, 6)}...`;
    setStatus(`${target}에 ${type} 명령 전송됨`);
    */
  };
  
  return (
    <div className="phone-app">
      <div className="header">
        <Link to="/" className="back-link">
          ← 홈으로
        </Link>
        <h1>갤럭시 워치 진동 컨트롤러</h1>
        <p className="device-mode">스마트폰 모드</p>
      </div>
      
      <div className="container">
        <div className="control-panel">
          <div className="section">
            <h2>워치 선택</h2>
            <div className="select-container">
              <select 
                id="watch-select"
                value={targetWatch}
                onChange={(e) => setTargetWatch(e.target.value)}
                disabled={!connected}
              >
                <option value="all">모든 워치</option>
                {connectedWatches.map(watchId => (
                  <option key={watchId} value={watchId}>
                    워치 {watchId.substring(0, 6)}...
                  </option>
                ))}
              </select>
            </div>
            <div className="watch-status">
              개발 모드: 시뮬레이션된 워치 연결
            </div>
          </div>
          
          <div className="section">
            <h2>진동 패턴</h2>
            <div className="select-container">
              <select
                id="pattern-select"
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
              >
                {patternOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="section">
            <h2>진동 명령</h2>
            <div className="vibration-controls">
              <button 
                className="vib-button"
                onClick={() => sendCommand('single')}
              >
                단일 진동
              </button>
              <button 
                className="vib-button"
                onClick={() => sendCommand('pattern')}
              >
                패턴 진동
              </button>
              <button 
                className="vib-button"
                onClick={() => sendCommand('repeated')}
              >
                반복 진동
              </button>
              <button 
                className="vib-button stop"
                onClick={() => sendCommand('stop')}
              >
                중지
              </button>
            </div>
          </div>
        </div>
        
        <div className="status-panel">
          <h2>상태</h2>
          <div className="status-container">
            <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
              {connected ? '서버 연결됨' : '서버 연결 끊김 (개발 모드)'}
            </div>
            <div className="status-message">{status}</div>
            
            {lastCommand && (
              <div className="last-command">
                마지막 명령: <strong>{lastCommand.type}</strong>
                {lastCommand.pattern && ` (${lastCommand.pattern})`}
              </div>
            )}
          </div>
        </div>
        
        <div className="help-section">
          <h2>도움말</h2>
          <div className="help-content">
            <p>
              <strong>단일 진동:</strong> 한 번의 진동을 보냅니다.
            </p>
            <p>
              <strong>패턴 진동:</strong> 선택된 패턴으로 진동합니다.
            </p>
            <p>
              <strong>반복 진동:</strong> 선택된 패턴을 계속 반복합니다.
            </p>
            <p>
              <strong>중지:</strong> 모든 진동을 멈춥니다.
            </p>
            <div className="note">
              <strong>참고:</strong> 실제 사용을 위해서는 워치에서 <a href="/watch" target="_blank">워치 모드</a>를 실행해야 합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneApp;