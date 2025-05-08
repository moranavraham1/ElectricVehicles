import React from 'react';
import { HomeIcon, MapIcon, UserIcon, HeartIcon, LogoutIcon } from '../common/Icons';
import NavigationBar from '../common/NavigationBar';
import Button from '../common/Button';

/**
 * Component for displaying charging status information
 */
const ChargingStatus = ({
  batteryLevel = 0,
  targetBatteryLevel = 100,
  timeRemaining = 0,
  isCharging = false,
  onStopCharging,
  station = {},
  estimatedCost = 0,
  totalEnergy = 0,
  isPaused = false,
  onPauseCharging,
  onResumeCharging
}) => {
  // Format time remaining nicely
  const formatTimeRemaining = (minutes) => {
    if (minutes <= 0) return 'Complete';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.max(
      Math.round(((batteryLevel - 0) / (targetBatteryLevel - 0)) * 100),
      0
    ),
    100
  );
  
  return (
    <div className="charging-status" style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <h2 style={{ fontSize: '22px', margin: '0 0 20px 0' }}>Charging Status</h2>
      
      {/* Station info */}
      <div style={{
        backgroundColor: '#f7f7f7',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>{station['Station Name'] || 'Charging Station'}</h3>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          {station.Address}, {station.City}
        </p>
      </div>
      
      {/* Battery progress indicator */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: '500' }}>Battery Level</span>
          <span style={{ fontWeight: '700' }}>{batteryLevel}%</span>
        </div>
        
        <div style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#e0e0e0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: isCharging ? '#4CAF50' : isPaused ? '#f39c12' : '#e74c3c',
            borderRadius: '10px',
            transition: 'width 0.5s ease'
          }}></div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          <span>Current: {batteryLevel}%</span>
          <span>Target: {targetBatteryLevel}%</span>
        </div>
      </div>
      
      {/* Charging info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div className="info-box" style={{
          backgroundColor: '#f7f7f7',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Time Remaining</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {formatTimeRemaining(timeRemaining)}
          </p>
        </div>
        
        <div className="info-box" style={{
          backgroundColor: '#f7f7f7',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Estimated Cost</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>₪{estimatedCost.toFixed(2)}</p>
        </div>
        
        <div className="info-box" style={{
          backgroundColor: '#f7f7f7',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Energy Used</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{totalEnergy.toFixed(2)} kWh</p>
        </div>
        
        <div className="info-box" style={{
          backgroundColor: '#f7f7f7',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Status</p>
          <p style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '700',
            color: isCharging ? '#4CAF50' : isPaused ? '#f39c12' : '#e74c3c'
          }}>
            {isCharging ? 'Charging' : isPaused ? 'Paused' : 'Stopped'}
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {isCharging ? (
          <>
            <Button 
              variant="warning" 
              onClick={onPauseCharging}
              style={{ flex: 1 }}
            >
              Pause Charging
            </Button>
            <Button 
              variant="danger" 
              onClick={onStopCharging}
              style={{ flex: 1 }}
            >
              Stop Charging
            </Button>
          </>
        ) : isPaused ? (
          <>
            <Button 
              variant="success" 
              onClick={onResumeCharging}
              style={{ flex: 1 }}
            >
              Resume Charging
            </Button>
            <Button 
              variant="danger" 
              onClick={onStopCharging}
              style={{ flex: 1 }}
            >
              End Session
            </Button>
          </>
        ) : (
          <Button 
            variant="primary" 
            onClick={onStopCharging}
            style={{ width: '100%' }}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChargingStatus; 