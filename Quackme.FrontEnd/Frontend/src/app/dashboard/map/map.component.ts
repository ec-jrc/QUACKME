import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActionTypes } from '../../reducers/actions';
import { MapState } from '../../sharedServices/models';
import { basedValues } from './../../sharedServices/stepsConaitener';
import * as L from 'leaflet';
import * as EL from 'esri-leaflet';

const iconsMap = {
  checked: '/assets/images/pin-gray.png',
  checkedSelected: '/assets/images/pin-gray-selected.png',
  notChecked: '/assets/images/pin-orange.png',
  notCheckedSelected: '/assets/images/pin-orange-selected.png',
};

@Component({
  selector: 'app-map',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MapComponent implements AfterViewInit {
  public map;
  public displayedStation = {};
  public currentSelectedStation = 0;
  private europeCoordinate = [51.505, 10.0];
  private chinaCoordinate = [29.1526584, 116.038547];
  private selectedZoom = 2.5;
  private currentZIndex = 1;
  constructor(
    private actionsSubj: ActionsSubject,
    private store: Store<{}>,
  ) { }

  public removeAllPoint() {
    const stationKeys = Object.keys(this.displayedStation);
    stationKeys.forEach((stationNumber) => {
      this.map.removeLayer(this.displayedStation[stationNumber]);
    });
    this.displayedStation = {};
  }

  public colorthreshold(observation) {
    const keys = Object.keys(observation);
    let edited = true;
    keys.forEach(key => {
      if (observation[key].status === basedValues.Suspicious || observation[key].status === basedValues.Warning) {
        edited = false;
      }
    });
    if (edited) {
      return 'checked';
    }
    return 'notChecked';
  }

  public clickEvent(e) {
    const selectedStation = this.displayedStation[e.target._leaflet_id];
    if (selectedStation === undefined) { return; }
    this.store.dispatch({ type: ActionTypes.ScrollToStation, station: selectedStation.options.stationNumber });
  }

  public printPoint(element, fileName) {
    const pinColor = this.colorthreshold(element.observation);
    const station = element.station;
    const myIcon = L.icon({
      iconUrl: iconsMap[pinColor],
      iconSize: [30, 30],
      iconType: pinColor,
    });
    const marker = L.marker([station.latitude, station.longitude], { icon: myIcon, ...station, fileName });
    marker.addTo(this.map).on('click', this.clickEvent.bind(this));
    this.displayedStation[marker._leaflet_id] = marker;
  }

  public removePoint(station) {
    const existingElement = this.displayedStation[station.stationNumber];
    this.map.removeLayer(existingElement);
    delete this.displayedStation[station.stationNumber];
  }

  public findSelectedStation(stationNumber) {
    const stationKeys = Object.keys(this.displayedStation);
    let selectedStation;
    if (stationKeys.length === 0) {
      return selectedStation;
    }
    let isNotSelected = true;
    let stationCounter = 0;
    while (isNotSelected) {
      if (this.displayedStation[stationKeys[stationCounter]].options.stationNumber === stationNumber) {
        isNotSelected = false;
        selectedStation = this.displayedStation[stationKeys[stationCounter]];
      }
      stationCounter++;
      if (stationCounter >= stationKeys.length) {
        isNotSelected = false;
      }
    }

    return selectedStation;
  }

  public hightlightStation(element) {
    if (element === undefined) { return; }
    const selectedStation = this.findSelectedStation(element.station.stationNumber);
    if (selectedStation === undefined) { return; }

    const station = element.station;
    this.map.panTo([station.latitude, station.longitude]);
    if (this.currentSelectedStation > 0) {
      const selectedStationPrevius = this.findSelectedStation(this.currentSelectedStation);
      selectedStationPrevius.remove();
      const iconType = selectedStationPrevius.options.icon.options.iconType;
      selectedStationPrevius.options.icon.options.iconUrl = iconsMap[iconType];
      selectedStationPrevius.addTo(this.map);
      selectedStationPrevius.setZIndexOffset(this.currentZIndex);
    }

    const iconType = selectedStation.options.icon.options.iconType;
    const iconUrl = iconsMap[iconType + 'Selected'];
    const myIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [30, 30],
      iconType: iconType,
    });
    selectedStation.setIcon(myIcon);
    this.currentZIndex = selectedStation._zIndex

    selectedStation.setZIndexOffset(100000);
    this.currentSelectedStation = station.stationNumber;
  }

  ngAfterViewInit() {
    this.map = L.map('mapid', { attributionControl: false }).setView(this.europeCoordinate, this.selectedZoom);
    const satelliteLayer = EL.basemapLayer('Imagery');
    const satelliteLabels = EL.basemapLayer('ImageryLabels');
    satelliteLayer.addTo(this.map);
    satelliteLabels.addTo(this.map);
    this.actionsSubj.
      subscribe((state: MapState) => {
        if (state.type === ActionTypes.RemoveAllStations) {
          this.removeAllPoint();
          this.currentSelectedStation = 0;
        }

        if (state.type === ActionTypes.AddAllStations) {
          this.removeAllPoint();
          state.selectedStation.forEach((element) => {
            this.printPoint(element, state.selectedStation.fileName);
          });
        }

        if (state.type === ActionTypes.HighLightSelectedStation) {
          this.hightlightStation(state.selectedElement);
        }

        if (state.type === ActionTypes.LoadSelectedFile) {
          this.removeAllPoint();
        }

        if (state.type === ActionTypes.FlyToEurope) {
          this.map.setZoom(this.selectedZoom).panTo(this.europeCoordinate);
        }

        if (state.type === ActionTypes.FlyToChina) {
          this.map.setZoom(this.selectedZoom).panTo(this.chinaCoordinate);
        }
      });
  }
}
