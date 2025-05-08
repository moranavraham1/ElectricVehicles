import React from 'react';
import Button from '../common/Button';
import { HeartIcon, LocationIcon, ChargingIcon, CalendarIcon } from '../common/Icons';
import wazeIcon from '../../assets/WAZE.jpg';

/**
 * Component for displaying detailed information about a charging station
 */
const StationDetail = ({
  station,
  isFavorite,
  toggleFavorite,
  startCharging,
  navigateToAppointment,
  distanceToStation,
  showDetails = true
}) => {
  const handleWazeNavigation = (e) => {
    e.stopPropagation();
    window.open(`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&navigate=yes`, '_blank');
  };

  return (
    <div className="station-detail" style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      {/* Header with station name and favorite button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0
        }}>
          {station['Station Name']}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {distanceToStation !== null && (
            <div style={{
              backgroundColor: '#f0f0f0',
              padding: '5px 12px',
              borderRadius: '15px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <LocationIcon /> {distanceToStation} km
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(station);
            }}
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              padding: '8px',
              cursor: 'pointer',
              backgroundColor: isFavorite(station) ? '#ffe0e0' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HeartIcon filled={isFavorite(station)} />
          </button>
        </div>
      </div>
      
      {/* Location information */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          <strong>Address:</strong> {station.Address}
        </p>
        <p style={{ margin: '5px 0', fontSize: '16px' }}>
          <strong>City:</strong> {station.City}
        </p>
        
        {showDetails && (
          <>
            <p style={{ margin: '5px 0', fontSize: '16px' }}>
              <strong>Charging Stations:</strong> {station['Duplicate Count']}
            </p>
            {station.Provider && (
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                <strong>Provider:</strong> {station.Provider}
              </p>
            )}
            {station['Socket Types'] && (
              <p style={{ margin: '5px 0', fontSize: '16px' }}>
                <strong>Socket Types:</strong> {station['Socket Types']}
              </p>
            )}
          </>
        )}
      </div>
      
      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
      }}>
        <Button
          variant="success"
          onClick={(e) => {
            e.stopPropagation();
            startCharging(station);
          }}
          style={{ flex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <ChargingIcon />
            <span>Start Charging</span>
          </div>
        </Button>
        
        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigateToAppointment(station);
          }}
          style={{ flex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <CalendarIcon />
            <span>Book Appointment</span>
          </div>
        </Button>
      </div>
      
      {/* Waze navigation */}
      <div 
        onClick={handleWazeNavigation}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        <img 
          src={wazeIcon} 
          alt="Waze" 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%'
          }}
        />
        <span>Navigate with Waze</span>
      </div>
    </div>
  );
};

export default StationDetail; 