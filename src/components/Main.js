import React from 'react';
import PropTypes from 'prop-types';
import { Map, ScaleControl, ZoomControl } from 'react-leaflet';
import { connect } from 'react-redux';

import Row from 'react-bootstrap/lib/Row';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';

import Layers from 'fm3/components/Layers';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ProgressIndicator from 'fm3/components/ProgressIndicator';
import Toasts from 'fm3/components/Toasts';

import SearchMenu from 'fm3/components/SearchMenu';
import SearchResults from 'fm3/components/SearchResults';

import ObjectsMenu from 'fm3/components/ObjectsMenu';
import ObjectsResult from 'fm3/components/ObjectsResult';

import MeasurementMenu from 'fm3/components/MeasurementMenu';
import DistanceMeasurementResult from 'fm3/components/DistanceMeasurementResult';
import AreaMeasurementResult from 'fm3/components/AreaMeasurementResult';
import ElevationMeasurementResult from 'fm3/components/ElevationMeasurementResult';
import LocationResult from 'fm3/components/LocationResult';

import RoutePlannerMenu from 'fm3/components/RoutePlannerMenu';
import RoutePlannerResult from 'fm3/components/RoutePlannerResult';

import TrackViewerMenu from 'fm3/components/TrackViewerMenu';
import TrackViewerResult from 'fm3/components/TrackViewerResult';

import SelectHomeLocationMenu from 'fm3/components/SelectHomeLocationMenu';

import GalleryMenu from 'fm3/components/GalleryMenu';
import GalleryResult from 'fm3/components/GalleryResult';
import GalleryPicker from 'fm3/components/GalleryPicker';

import Settings from 'fm3/components/Settings';

import OpenInExternalAppMenuButton from 'fm3/components/OpenInExternalAppMenuButton';
import ToolsMenuButton from 'fm3/components/ToolsMenuButton';
import MoreMenuButton from 'fm3/components/MoreMenuButton';

import AsyncElevationChart from 'fm3/components/AsyncElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPoint from 'fm3/components/InfoPoint';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import Changesets from 'fm3/components/Changesets';

import MapDetailsMenu from 'fm3/components/MapDetailsMenu';
import MapDetails from 'fm3/components/MapDetails';

import ShareMapModal from 'fm3/components/ShareMapModal';
import EmbedMapModal from 'fm3/components/EmbedMapModal';
import LoginModal from 'fm3/components/LoginModal';

import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus } from 'fm3/actions/mapActions';
import { setTool, setLocation, exportGpx, clearMap, toggleLocate } from 'fm3/actions/mainActions';
import { authCheckLogin } from 'fm3/actions/authActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';
import 'leaflet/dist/leaflet.css';

class Main extends React.Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    tool: FmPropTypes.tool,
    mapType: FmPropTypes.mapType.isRequired,
    onToolSet: PropTypes.func.isRequired,
    onMapRefocus: PropTypes.func.isRequired,
    activeModal: PropTypes.string,
    progress: PropTypes.bool.isRequired,
    onLocationSet: PropTypes.func.isRequired,
    mouseCursor: PropTypes.string.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
    onCheckLogin: PropTypes.func.isRequired,
    ignoreEscape: PropTypes.bool.isRequired,
    showElevationChart: PropTypes.bool.isRequired,
    showGalleryPicker: PropTypes.bool.isRequired,
    onGpxExport: PropTypes.func.isRequired,
    onMapClear: PropTypes.func.isRequired,
    onLocate: PropTypes.func.isRequired,
    locate: PropTypes.bool.isRequired,
    showLoginModal: PropTypes.bool,
  };

  componentWillMount() {
    this.props.onCheckLogin();
  }

  componentDidMount() {
    setMapLeafletElement(this.map.leafletElement);
    document.addEventListener('keydown', (event) => {
      if (event.keyCode === 27 /* escape key */ && !this.props.ignoreEscape) {
        this.props.onToolSet(null);
      }
    });

    if (this.props.embeddedMode) {
      document.body.classList.add('embedded');
    }
  }

  componentWillUnmount() {
    setMapLeafletElement(null);
  }

  handleMapMoveEnd = () => {
    // TODO analyze why this can be null
    if (!this.map) {
      return;
    }

    const map = this.map.leafletElement;
    const { lat, lng: lon } = map.getCenter();
    const zoom = map.getZoom();

    if (this.props.lat !== lat || this.props.lon !== lon || this.props.zoom !== zoom) {
      this.props.onMapRefocus({ lat, lon, zoom });
    }
  }

  handleLocationFound = (e) => {
    this.props.onLocationSet(e.latitude, e.longitude, e.accuracy);
  }

  openFreemapInNonEmbedMode = () => {
    const currentURL = window.location.href;
    window.open(currentURL.replace('&embed=true', ''), '_blank');
  }

  render() {
    const { lat, lon, zoom, mapType,
      tool, activeModal, progress, mouseCursor, embeddedMode, showElevationChart, showGalleryPicker, onMapClear,
      showLoginModal } = this.props;

    const showDefaultMenu = [null, 'location'].includes(tool);

    return (
      <div>
        <div className="tool-buttons">
          <ButtonToolbar>
            <ButtonGroup vertical>
              <ToolsMenuButton />
              <Button bsSize="small" onClick={onMapClear} title="Vyčistiť mapu">
                <FontAwesomeIcon icon="eraser" />
              </Button>
              <Button bsSize="small" onClick={this.props.onLocate} title="Kde som?" active={this.props.locate}>
                <FontAwesomeIcon icon="dot-circle-o" />
              </Button>
              <Button bsSize="small" onClick={this.props.onGpxExport} title="Exportovať do GPX">
                <FontAwesomeIcon icon="share" />
              </Button>
              <OpenInExternalAppMenuButton lat={lat} lon={lon} zoom={zoom} mapType={mapType} />
              <MoreMenuButton />
            </ButtonGroup>
          </ButtonToolbar>
        </div>

        {embeddedMode && <button id="freemap-logo" className="embedded" onClick={this.openFreemapInNonEmbedMode} />}
        <Toasts />
        {tool === 'search' && <SearchMenu />}
        {tool === 'objects' && <ObjectsMenu />}
        {tool === 'route-planner' && <RoutePlannerMenu />}
        {(tool === 'measure-dist' || tool === 'measure-ele' || tool === 'measure-area') && <MeasurementMenu />}
        {tool === 'track-viewer' && <TrackViewerMenu />}
        {tool === 'info-point' && <InfoPointMenu />}
        {tool === 'changesets' && <ChangesetsMenu />}
        {tool === 'gallery' && <GalleryMenu />}
        {tool === 'select-home-location' && <SelectHomeLocationMenu />}
        {tool === 'map-details' && <MapDetailsMenu />}
        {activeModal === 'settings' && <Settings />}
        {activeModal === 'share' && <ShareMapModal />}
        {activeModal === 'embed' && <EmbedMapModal />}
        {showLoginModal && <LoginModal />}
        {/* TODO !embeddedMode &&
          <Row>
            <ProgressIndicator active={progress} />
          </Row>
        */}
        <Row className={`map-holder active-map-type-${mapType}`}>
          <Map
            zoomControl={false}
            minZoom={8}
            ref={(map) => { this.map = map; }}
            center={L.latLng(lat, lon)}
            zoom={zoom}
            onMoveend={this.handleMapMoveEnd}
            onMousemove={handleMapMouseMove}
            onMouseover={handleMapMouseOver}
            onMouseout={handleMapMouseOut}
            onClick={handleMapClick}
            onLocationfound={this.handleLocationFound}
            style={{ cursor: mouseCursor }}
            maxBounds={[[47.040256, 15.4688], [49.837969, 23.906238]]}
          >
            <ZoomControl position="topright" />
            <Layers />

            <ScaleControl imperial={false} position="bottomright" />
            {(showDefaultMenu || tool === 'search') && <SearchResults />}

            <ObjectsResult />
            <RoutePlannerResult />
            <DistanceMeasurementResult />
            <ElevationMeasurementResult />
            <AreaMeasurementResult />
            <LocationResult />
            <TrackViewerResult />
            <InfoPoint />

            <Changesets />
            {tool === 'map-details' && <MapDetails />}
            {showElevationChart && <AsyncElevationChart />}
            {(tool === null || tool === 'gallery') && showGalleryPicker && <GalleryPicker />}
            <GalleryResult />
          </Map>
        </Row>
      </div>
    );
  }
}

export default connect(
  state => ({
    lat: state.map.lat,
    lon: state.map.lon,
    zoom: state.map.zoom,
    tool: state.main.tool,
    mapType: state.map.mapType,
    activeModal: state.main.activeModal,
    progress: !!state.main.progress.length,
    mouseCursor: selectMouseCursor(state),
    embeddedMode: state.main.embeddedMode,
    user: state.auth.user,
    ignoreEscape: !!(state.main.activeModal && state.main.activeModal !== 'settings' // TODO settings dialog gets also closed
      || state.gallery.activeImageId),
    showElevationChart: !!state.elevationChart.elevationProfilePoints,
    showGalleryPicker: isShowGalleryPicker(state),
    locate: state.main.locate,
    showLoginModal: state.auth.chooseLoginMethod,
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onCheckLogin() {
      dispatch(authCheckLogin());
    },
    onGpxExport() {
      dispatch(exportGpx());
    },
    onMapClear() {
      dispatch(clearMap());
    },
    onLocate() {
      dispatch(toggleLocate());
    },
  }),
)(Main);

function handleMapClick({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mapClick', lat, lon);
}

function handleMapMouseMove({ latlng: { lat, lng: lon }, originalEvent }) {
  mapEventEmitter.emit('mouseMove', lat, lon, originalEvent);
}

function handleMapMouseOver({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOver', lat, lon);
}

function handleMapMouseOut({ latlng: { lat, lng: lon } }) {
  mapEventEmitter.emit('mouseOut', lat, lon);
}

function selectMouseCursor(state) {
  switch (state.main.tool) {
    case 'measure-dist':
    case 'measure-ele':
    case 'measure-area':
    case 'select-home-location':
    case 'map-details':
    case 'route-planner':
      return state.routePlanner.pickMode ? 'crosshair' : 'auto';
    default:
      return isShowGalleryPicker(state) ? 'crosshair' : 'auto';
  }
}

function isShowGalleryPicker(state) {
  return (state.main.tool === null || state.main.tool === 'gallery')
    && state.gallery.show
    && state.gallery.pickingPositionForId === null;
}
