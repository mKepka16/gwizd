<script lang="ts">
  import Map from '@arcgis/core/Map.js';
  import MapImageLayer from '@arcgis/core/layers/MapImageLayer.js';
  import MapView from '@arcgis/core/views/MapView.js';
  import TileInfo from '@arcgis/core/layers/support/TileInfo.js';
  import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
  import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
  import Popup from '@arcgis/core/widgets/Popup.js';
  import Graphic from '@arcgis/core/Graphic.js';
  import axios from 'axios';
  import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
  import { type Report, URL } from '../../api';

  import Basemap from '@arcgis/core/Basemap.js';

  import '@arcgis/core/assets/esri/themes/light/main.css';
  import { loadReports } from '../../api';

  let basemap = new Basemap({
    baseLayers: [
      new MapImageLayer({
        url: '//miip.geomalopolska.pl/arcgis/rest/services/MIIP_Orto2023/MapServer',
        title: 'Basemap',
      }),
    ],
    title: 'basemap',
    id: 'basemap',
  });

  let map = new Map({
    basemap: basemap,
  });

  const createMap = (domNode: any) => {
    let view = new MapView({
      container: domNode,
      map: map,
      // scale: 240_000,
      constraints: {
        lods: TileInfo.create().lods,
      },
      center: [19.944544, 50.049683], // longitude, latitude
    });
  };

  function getFormattedDate(date: Date): string {
    // Get the components (hours, minutes, day, month, and year) from the Date object
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure 2-digit format
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit format
    const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit format
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
    const year = date.getFullYear();

    // Create the formatted string
    const formattedDate = `${hours}:${minutes} ${day}.${month}.${year}`;
    return formattedDate;
  }

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  loadReports().then((reports) => {
    const places: Report[] = reports;
    console.log(reports);
    const graphics = places.map((place) => {
      const point = {
        //Create a point
        type: 'point',
        longitude: place.lon,
        latitude: place.lat,
      };

      const pointGraphic = new Graphic({
        // @ts-ignore
        geometry: point,
        symbol: {
          color: [40, 20, 2],
        },
        // popupTemplate: {
        //   title: 'fd',
        //   content: 'fd',
        //   fieldInfos: [{ fieldName: 'fd', label: 'xd' }],
        // },
        attributes: {
          ...place,
          date: getFormattedDate(new Date(place.createdDate)),
          image: place.photoUrl ? `<img src="${URL}/${place.photoUrl}"/>` : '',
          death: place.dead ? `<h4 class="h4">Zwierzę jest martwe.</h4>` : '',
          road: place.road
            ? `<h4 class="h4">Zwierzę znaleziono przy drodzę.</h4>`
            : '',
          species: place.species
            ? `<h2 class="h2">Gatunek: ${
                place.species.toLowerCase() === 'nie wiem'
                  ? 'Nie rozpoznany przez zgłaszającego'
                  : place.species
              }</h2>`
            : '',
          aaa: place.species
            ? `<p>Gatunek: ${
                place.species.toLowerCase() === 'nie wiem'
                  ? 'Nie rozpoznany przez zgłaszającego'
                  : place.species
              }</p>`
            : '',
        },
      });
      return pointGraphic;
    });

    const layer = new FeatureLayer({
      source: graphics, // array of graphics objects
      displayField: 'fdfdfd',

      title: 'fdfdfd',
      objectIdField: 'id',
      fields: [
        {
          name: 'id',
          type: 'integer',
        },
        {
          name: 'description',
          type: 'string',
        },
        {
          name: 'image',
          type: 'string',
        },
        {
          name: 'species',
          type: 'string',
        },
        {
          name: 'aaa',
          type: 'string',
        },
        {
          name: 'date',
          type: 'string',
        },
        {
          name: 'death',
          type: 'string',
        },
        {
          name: 'road',
          type: 'string',
        },
      ],
      popupTemplate: {
        title: '{aaa}',
        content: `
          <h4 class="h4">Opis: {description}</h4> 
          <h4 class="h4">Data zgłoszenia: {date}</h4> 
          {death}
          {road}
          {image}
          `,
      },
    });
    map.add(layer);

    // Define a pop-up for Trailheads
    // const popupTrailheads = {
    //   title: 'Trailhead',
    //   content:
    //     '<b>Trail:</b> {TRL_NAME}<br><b>City:</b> {CITY_JUR}<br><b>Cross Street:</b> {X_STREET}<br><b>Parking:</b> {PARKING}<br><b>Elevation:</b> {ELEV_FT} ft',
    // };

    // const trails = new FeatureLayer({
    //   url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0',
    //   outFields: ['TRL_NAME', 'ELEV_GAIN'],
    //   popupTemplate: popupTrails,
    // });

    // map.add(trails, 0);
  });
</script>

<div id="viewDiv" use:createMap />

<style>
  #viewDiv {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
