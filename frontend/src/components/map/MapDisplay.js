import React from 'react';

/**
 * Map display component used in station cards
 * Shows the station location on a map
 */
const MapDisplay = ({
  station,
  index,
  toggleFullMap,
  showFullMap,
  mapLoading,
  fullMapLoading,
  handleMapLoad,
  handleMapLoadStart,
  handleFullMapLoad
}) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative'
    }} onClick={() => toggleFullMap(index)}>
      {showFullMap && showFullMap[index] ? (
        <>
          {fullMapLoading && fullMapLoading[index] && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              zIndex: 10
            }}>
              <div>Loading map...</div>
            </div>
          )}
          <iframe
            src={`https://maps.google.com/maps?q=${station.Latitude},${station.Longitude}&z=15&output=embed`}
            width="100%"
            height="200"
            style={{
              border: 0,
              width: '100%',
              height: '200px',
              borderRadius: '8px',
              marginTop: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 5
            }}
            onLoad={() => handleFullMapLoad(index)}
            title={`Full map for ${station['Station Name']}`}
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleFullMap(index);
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '30px',
              height: '30px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 10
            }}
          >
            <span style={{ fontSize: '18px' }}>×</span>
          </div>
        </>
      ) : (
        <>
          {mapLoading && mapLoading[index] && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              zIndex: 10
            }}>
              <div>Loading map...</div>
            </div>
          )}
          <iframe
            src={`https://maps.google.com/maps?q=${station.Latitude},${station.Longitude}&z=15&output=embed`}
            width="100%"
            height="100"
            style={{
              border: 0,
              width: '100%',
              height: '100px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 5
            }}
            onLoad={() => handleMapLoad(index)}
            onLoadStart={() => handleMapLoadStart(index)}
            title={`Map for ${station['Station Name']}`}
          />
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '25px',
              height: '25px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              zIndex: 10
            }}
          >
            <span style={{ fontSize: '14px' }}>+</span>
          </div>
        </>
      )}
    </div>
  );
};

export default MapDisplay; 