import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export default class OpenInExternalAppMenuButton extends React.Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    zoom: PropTypes.number.isRequired,
    mapType: PropTypes.string,
  };

  state = {
    show: false,
  }

  setButton = (button) => {
    this.button = button;
  };

  openIn(where) {
    this.setState({ show: false });

    const { lat, lon, zoom, mapType } = this.props;

    switch (where) {
      case 'osm.org':
        window.open(`https://www.openstreetmap.org/#map=${zoom > 19 ? 19 : zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'osm.org/id':
        window.open(`https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`);
        break;
      case 'josm': {
        const bounds = getMapLeafletElement().getBounds();
        axios.get('http://localhost:8111/load_and_zoom', {
          params: {
            left: bounds.getWest(),
            right: bounds.getEast(),
            top: bounds.getNorth(),
            bottom: bounds.getSouth(),
          },
        });
        break;
      }
      case 'hiking.sk': {
        const point = L.CRS.EPSG3857.project(L.latLng(lat, lon));
        window.open(`https://mapy.hiking.sk/?zoom=${zoom > 15 ? 15 : zoom}&lon=${point.x}&lat=${point.y}&layers=00B00FFFTTFTTTTFFFFFFTTT`);
        break;
      }
      case 'google':
        window.open(`https://www.google.sk/maps/@${lat},${lon},${zoom}z`);
        break;
      case 'mapy.cz/ophoto':
        window.open(`https://mapy.cz/zakladni?x=${lon}&y=${lat}&z=${zoom > 19 ? 19 : zoom}&base=ophoto`);
        break;
      case 'oma.sk':
        window.open(`http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}&mapa=${mapType}`);
        break;
      default:
        break;
    }
  }

  handleButtonClick = () => {
    this.setState({ show: true });
  }

  handleHide = () => {
    this.setState({ show: false });
  }

  render() {
    return (
      <Button bsSize="small" ref={this.setButton} onClick={this.handleButtonClick} title="Otvoriť v externej aplikácii">
        <FontAwesomeIcon icon="external-link" />
        <Overlay rootClose placement="right" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" title="Otvoriť v externej aplikácii">
            <ListGroup>
              <ListGroupItem onClick={() => this.openIn('osm.org')}>OpenStreetMap</ListGroupItem>
              <ListGroupItem onClick={() => this.openIn('oma.sk')}>OMA</ListGroupItem>
              <ListGroupItem onClick={() => this.openIn('google')}>Google Mapy</ListGroupItem>
              <ListGroupItem onClick={() => this.openIn('hiking.sk')}>Hiking.sk</ListGroupItem>
              <ListGroupItem onClick={() => this.openIn('mapy.cz/ophoto')}>Mapy.cz Letecká</ListGroupItem>
            </ListGroup>
            <ListGroup>
              <ListGroupItem onClick={() => this.openIn('josm')}>Editor JOSM</ListGroupItem>
              <ListGroupItem onClick={() => this.openIn('osm.org/id')}>Editor iD</ListGroupItem>
            </ListGroup>
          </Popover>
        </Overlay>
      </Button>
    );
  }
}
