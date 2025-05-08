# Electric Vehicles Charging App Components

This directory contains reusable components for the Electric Vehicles Charging Application.

## Common Components

Located in `components/common/`:

- **Button** - A customizable button component with various styles and variants.
- **Icons** - Collection of SVG icons used throughout the application.
- **NavigationBar** - App navigation bar with links to main sections.
- **SearchBar** - Reusable search field with suggestions dropdown.

## Station Components

Located in `components/station/`:

- **StationCard** - Card display for charging stations in list views.
- **StationDetail** - Detailed information about a charging station.

## Map Components

Located in `components/map/`:

- **MapDisplay** - Component for showing a station's location on a map.

## Charging Components

Located in `components/charging/`:

- **ChargingStatus** - Display of current charging session information including battery level, time remaining, and cost.

## How to Use Components

### Button Component

```jsx
import Button from '../components/common/Button';

// Simple usage
<Button onClick={handleClick}>Click Me</Button>

// With variant
<Button variant="success" onClick={handleSave}>Save</Button>

// Available variants: primary, secondary, success, danger, warning, link
```

### Icons

```jsx
import { HomeIcon, ChargingIcon, HeartIcon } from '../components/common/Icons';

// Simple usage
<HomeIcon />

// With filled heart
<HeartIcon filled={true} />
```

### NavigationBar

```jsx
import NavigationBar from '../components/common/NavigationBar';

<NavigationBar 
  userName="John Doe"
  activePage="home"
  onLogout={handleLogout}
/>
```

### SearchBar

```jsx
import SearchBar from '../components/common/SearchBar';

<SearchBar 
  placeholder="Search stations..." 
  value={searchQuery}
  onSearchChange={setSearchQuery}
  onSearch={handleSearch}
  suggestions={suggestedStations} 
  onSuggestionClick={handleStationSelect}
/>
```

### StationCard

```jsx
import StationCard from '../components/station/StationCard';

<StationCard 
  station={stationData}
  index={index}
  toggleFavorite={handleToggleFavorite}
  isFavorite={checkIsFavorite}
  distanceToStation={calculateDistance(lat, lon, stationData.Latitude, stationData.Longitude)}
  toggleFullMap={handleToggleFullMap}
  showFullMap={fullMapState}
  startCharging={handleStartCharging}
  navigateToAppointment={handleAppointmentNavigation}
/>
```

### StationDetail

```jsx
import StationDetail from '../components/station/StationDetail';

<StationDetail 
  station={selectedStation}
  isFavorite={checkIsFavorite}
  toggleFavorite={handleToggleFavorite}
  distanceToStation={distance}
  startCharging={handleStartCharging}
  navigateToAppointment={handleAppointmentNavigation}
/>
```

### MapDisplay

```jsx
import MapDisplay from '../components/map/MapDisplay';

<MapDisplay 
  station={stationData}
  index={index}
  toggleFullMap={handleToggleFullMap}
  showFullMap={fullMapState}
  mapLoading={mapLoadingState}
  handleMapLoad={handleMapLoad}
  handleMapLoadStart={handleMapLoadStart}
  handleFullMapLoad={handleFullMapLoad}
/>
```

### ChargingStatus

```jsx
import ChargingStatus from '../components/charging/ChargingStatus';

<ChargingStatus 
  batteryLevel={currentBatteryLevel}
  targetBatteryLevel={targetLevel}
  timeRemaining={remainingTime}
  isCharging={chargingStatus}
  onStopCharging={handleStopCharging}
  station={stationData}
  estimatedCost={calculatedCost}
  totalEnergy={energyUsed}
  isPaused={isPaused}
  onPauseCharging={handlePauseCharging}
  onResumeCharging={handleResumeCharging}
/>
``` 