import { Camera, CameraResultType } from '@capacitor/camera';
import { Navigator, useNavigate } from '@solidjs/router';
import { createEffect, createResource, createSignal, onMount } from 'solid-js';

import { default as ArcMap } from '@arcgis/core/Map';
import Basemap from '@arcgis/core/Basemap';
import { FaSolidCamera } from 'solid-icons/fa';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { FiMenu } from 'solid-icons/fi';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import MapView from '@arcgis/core/views/MapView';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import Track from '@arcgis/core/widgets/Track';

const API_URL = 'http://192.168.127.203:9000';

type GetData = {
  lon: number;
  lat: number;
  species: string;
  photoUrl: string;
  dead: boolean;
  createdDate: string;
  description: string;
  road: boolean;
};

async function takePictureAndSubmit(navigate: Navigator) {
  console.log('Camera function');
  await Camera.requestPermissions();
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
  });
  const path = encodeURIComponent(image.webPath);
  console.log('path: ', path);
  navigate(`/submitForm?i=${path}`);
}

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

function makePoint(spot: GetData) {
  const point = {
    //Create a point
    type: 'point',
    longitude: spot.lon,
    latitude: spot.lat,
  };

  return new Graphic({
    //@ts-ignore
    geometry: point,
    symbol: {
      //@ts-ignore
      type: 'simple-marker',
      color: [226, 119, 40], // Orange
      size: 12,
      outline: {
        color: [255, 255, 255], // White
        width: '1.5px',
      },
    },
    attributes: {
      ...spot,
      date: getFormattedDate(new Date(spot.createdDate)),
      image: spot.photoUrl ? `<img src="${API_URL}/${spot.photoUrl}"/>` : '',
      species: spot.species
        ? `<h2 class="h2">Gatunek: ${
            spot.species.toLowerCase() === 'nie wiem'
              ? 'Nie rozpoznany przez zgłaszającego'
              : spot.species
          }</h2>`
        : '',
      aaa: spot.species
        ? `<p>Gatunek: ${
            spot.species.toLowerCase() === 'nie wiem'
              ? 'Nie rozpoznany przez zgłaszającego'
              : spot.species
          }</p>`
        : '',
    },
  });
}

export default function Home() {
  let mapRef: HTMLDivElement | undefined;
  const navigate = useNavigate();
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

  let map = new ArcMap({
    basemap: basemap,
  });
  const [points] = createResource(async () => {
    return fetch(`${API_URL}/places`).then(async (json) => {
      const data = (await json.json()) as GetData[];
      console.log(data);
      return data;
    });
  });
  createEffect(() => {
    if (points()) {
      const graphics = points().map((point) => !point.dead && makePoint(point));
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
        ],
        popupTemplate: {
          title: '{aaa}',
          content: `
          <h4 class="h4">Opis: {description}</h4> 
          <h4 class="h4">Data zgłoszenia: {date}</h4> 
          {image}
          `,
        },
      });
      map.add(layer);
    }
  });
  onMount(() => {
    if (!mapRef) return;
    let view = new MapView({
      container: mapRef,
      map: map,
      constraints: {
        lods: TileInfo.create().lods,
      },
      center: [19.944544, 50.049683],
      scale: 100000,
    });
    const track = new Track({
      view: view,
      graphic: new Graphic({
        symbol: {
          //@ts-ignore
          type: 'simple-marker',
          size: 12,
          color: 'green',
          outline: {
            color: '#efefef',
            width: '1.5px',
          },
        },
      }),
      useHeadingEnabled: false,
    });
    view.ui.add(track, 'top-left');
  });

  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  return (
    <div class='relative w-[360px]'>
      <div class='w-screen h-screen' ref={mapRef!} />
      <div class='absolute top-2 w-screen flex px-5 justify-end'>
        <button
          class='text-white bg-green-500 hover:bg-green-800 focus:outline-none
                    focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-5
                    text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
        >
          <FiMenu size={30} />
        </button>
      </div>
      <div class='absolute w-screen bottom-0 flex gap-5 justify-center'>
        <button
          type='button'
          onClick={() => takePictureAndSubmit(navigate)}
          class='text-white bg-green-700 hover:bg-green-800 focus:outline-none
                    focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5
                    text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
        >
          <FaSolidCamera size={60} />
        </button>
        <a
          href='/submitForm'
          class='text-white bg-green-700 hover:bg-green-800 focus:outline-none
                    focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5
                    text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
        >
          <svg
            fill='#ffffff'
            height='80px'
            width='60px'
            version='1.1'
            id='Capa_1'
            xmlns='http://www.w3.org/2000/svg'
            xmlns:xlink='http://www.w3.org/1999/xlink'
            viewBox='0 0 297 297'
            xml:space='preserve'
            data-darkreader-inline-fill=''
            style='--darkreader-inline-fill: #000000;'
          >
            <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
            <g
              id='SVGRepo_tracerCarrier'
              stroke-linecap='round'
              stroke-linejoin='round'
            ></g>
            <g id='SVGRepo_iconCarrier'>
              {' '}
              <g>
                {' '}
                <path d='M256.702,62.176H240.07c2.111,2.171,5.056,3.527,8.316,3.527S254.591,64.347,256.702,62.176z'></path>{' '}
                <path d='M269.616,62.176c-3.266,8.549-11.548,14.639-21.23,14.639c-9.682,0-17.965-6.09-21.23-14.639h-47.112 c23.97,15.379,41.139,40.463,45.934,69.66H297v-69.66H269.616z'></path>{' '}
                <path d='M124.853,109.249c-21.643,0-39.251,17.608-39.251,39.251s17.608,39.251,39.251,39.251s39.251-17.608,39.251-39.251 S146.496,109.249,124.853,109.249z M124.853,165.164c-9.189,0-16.663-7.476-16.663-16.664s7.475-16.664,16.663-16.664 s16.664,7.476,16.664,16.664S134.041,165.164,124.853,165.164z'></path>{' '}
                <path d='M124.853,62.176c-47.599,0-86.324,38.725-86.324,86.324s38.725,86.324,86.324,86.324s86.324-38.725,86.324-86.324 S172.452,62.176,124.853,62.176z M124.853,203.914c-30.556,0-55.414-24.859-55.414-55.414s24.859-55.414,55.414-55.414 s55.414,24.859,55.414,55.414S155.409,203.914,124.853,203.914z'></path>{' '}
                <path d='M22.741,139.776c0.478-5.644,1.412-11.16,2.771-16.509c-0.089-0.003-0.176-0.013-0.266-0.013 C11.325,123.254,0,134.579,0,148.5s11.325,25.246,25.246,25.246c0.09,0,0.177-0.011,0.266-0.013 c-1.359-5.349-2.293-10.865-2.771-16.509c-3.792-1.091-6.577-4.585-6.577-8.724S18.948,140.868,22.741,139.776z'></path>{' '}
              </g>{' '}
            </g>
          </svg>
        </a>
      </div>
    </div>
  );
}
