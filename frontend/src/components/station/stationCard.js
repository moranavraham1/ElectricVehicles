import React from 'react';
import { useNavigate } from 'react-router-dom';
import wazeIcon from '../../assets/WAZE.jpg';
import MapDisplay from '../map/MapDisplay';
import Button from '../components/common/Button';
import { HeartIcon } from '../common/Icons';
import NavigationBar from '../components/common/NavigationBar';

/**
 * StationCard component for displaying charging station information
 */
const StationCard = ({ 
  station, 
  index, 
  toggleFavorite, 
  isFavorite, 
  latitude, 
  longitude, 
  distanceToStation,
  toggleFullMap,
  showFullMap,
  mapLoading,
  fullMapLoading,
  handleMapLoad,
  handleMapLoadStart,
  handleFullMapLoad,
  startCharging,
  navigateToAppointment
}) => {
  const navigate = useNavigate();

  return (
    <div className="station-card" style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      padding: '15px',
      margin: '0 0 16px 0',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      background: 'white',
      position: 'relative',
      overflow: 'hidden',
      gap: '10px'
    }}>
      {/* Right side - station info and details */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Station details */}
        <div>
          <h3 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginTop: '0',
            marginBottom: '10px'
          }}>{station['Station Name']}</h3>

          <div style={{ marginBottom: '10px' }}>
            <p style={{
              margin: '5px 0',
              fontSize: '16px',
              fontWeight: '500'
            }}><strong>Address:</strong> {station.Address}</p>
            <p style={{
              margin: '5px 0',
              fontSize: '16px',
              fontWeight: '500'
            }}><strong>City:</strong> {station.City}</p>
            <p style={{
              margin: '5px 0',
              fontSize: '16px',
              fontWeight: '500'
            }}><strong>Charging Stations:</strong> {station['Duplicate Count']}</p>
          </div>
        </div>

        {/* Waze logo and button */}
        <img
          src={wazeIcon}
          alt="Waze Navigation"
          className="waze-logo"
          style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: '5px',
            backgroundColor: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 999,
            cursor: 'pointer',
            border: 'none',
            display: 'block'
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://waze.com/ul?ll=${station.Latitude},${station.Longitude}&navigate=yes`, '_blank')
          }}
        />
      </div>

      {/* Buttons in the station card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 15px',
        gap: '10px',
        position: 'relative',
        marginRight: '35px',
        marginLeft: '-40px',
        marginTop: '-10px'
      }}>
        {/* Distance and favorites icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          marginBottom: '15px',
          marginTop: '15px'
        }}>
          <div style={{
            padding: '5px 10px',
            backgroundColor: '#f0f0f0',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '80px'
          }}>
            {distanceToStation !== null ? `${distanceToStation} km` : 'N/A'} 
          </div>
          <button
            className={`favorite-button ${isFavorite(station) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(station);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
              borderRadius: '50%',
              backgroundColor: isFavorite(station) ? '#ffe0e0' : 'transparent',
              transition: 'background-color 0.3s ease'
            }}
          >
            <HeartIcon filled={isFavorite(station)} />
          </button>
        </div>

        {/* Interactive buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          marginTop: '15px'
        }}>
          <Button
            variant="success"
            onClick={(e) => {
              e.stopPropagation();
              startCharging(station);
            }}
          >
            Start Charging
          </Button>

          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigateToAppointment(station);
            }}
          >
            Make Appointment
          </Button>
        </div>
      </div>

      {/* Map on the left side */}
      <MapDisplay 
        station={station}
        index={index}
        toggleFullMap={toggleFullMap}
        showFullMap={showFullMap}
        mapLoading={mapLoading}
        fullMapLoading={fullMapLoading}
        handleMapLoad={handleMapLoad}
        handleMapLoadStart={handleMapLoadStart}
        handleFullMapLoad={handleFullMapLoad}
      />
    </div>
  );
};

export default StationCard;