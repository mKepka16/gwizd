import '@thisbeyond/solid-select/style.css';
import './Submit.css';

import {
  For,
  Show,
  Suspense,
  createEffect,
  createResource,
  createSignal,
} from 'solid-js';
import { Navigator, useNavigate, useSearchParams } from '@solidjs/router';
import {
  Select,
  createAsyncOptions,
  createOptions,
} from '@thisbeyond/solid-select';

import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Geolocation } from '@capacitor/geolocation';

const API_URL = 'http://192.168.127.203:9000';

type SendData = {
  lon: number;
  lat: number;
  species: string;
  description: string;
  road: boolean;
  dead: boolean;
  photo: File;
};

async function urlToFile(url: string, filename: string): Promise<File> {
  console.log('fetching: ', url);
  const blob = await (await fetch(url)).blob();
  return new File([blob], filename);
}

async function sendData(data: SendData, navigate: Navigator) {
  const form = new FormData();
  form.append('lon', data.lon.toString());
  form.append('lat', data.lat.toString());
  form.append('species', data.species);
  form.append('description', data.description);
  form.append('road', data.road ? 'true' : 'false');
  form.append('dead', data.dead ? 'true' : 'false');
  form.append('photo', data.photo);

  const options = {
    method: 'POST',
    body: form,
  };

  await fetch(`${API_URL}/add`, options);
  navigate('/thanks', { replace: true });
}

type AnimalDesc = {
  imageUrl: string;
  desription: string;
};

export default function Submit() {
  let fileInput: HTMLInputElement | undefined;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  createEffect(() => {
    console.log('submit effect!');
    if (searchParams.i) {
      urlToFile(searchParams.i, 'photo.png').then((file) => {
        setSelectedFile((old) => file);
        setCheckFile(true);
        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileInput ? (fileInput.files = transfer.files) : undefined;
      });
    }
  });
  const [selectedFile, setSelectedFile] = createSignal<File>(undefined);
  const [checkFile, setCheckFile] = createSignal(false);
  const [selected, setSelected] = createSignal('invalid');
  const canAdd = () => selected() !== 'invalid';
  const [location] = createResource(async () => {
    if (Capacitor.getPlatform() !== 'web') {
      const permissions = await Geolocation.requestPermissions();
      if (permissions.location) {
        const position = await Geolocation.getCurrentPosition();
        return [position.coords.latitude, position.coords.longitude] as const;
      }
    }
    const location = await Geolocation.getCurrentPosition();
    return [location.coords.latitude, location.coords.longitude] as const;
  });
  const selectOptions = createAsyncOptions(async (input): Promise<string[]> => {
    const options = await fetch(`${API_URL}/species`).then(async (json) => {
      const data = (await json.json()) as string[];
      console.log(data);
      return data;
    });
    return options.filter((option) =>
      option.toLowerCase().startsWith(input.toLowerCase())
    );
  });

  const [currentAnimal] = createResource(selected, async (current) => {
    return fetch(`${API_URL}/species/${encodeURIComponent(current)}`).then(
      async (json) => {
        const data = (await json.json()) as AnimalDesc;
        console.log(data);
        return data;
      }
    );
  });

  const imageHandler = (e: any) => {
    setSelectedFile(e.target.files[0]);
    setCheckFile(true);
  };

  return (
    <Suspense>
      <div class='overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-screen md:h-full'>
        <div class='relative p-4 w-full max-w-2xl h-full md:h-auto'>
          <div class='relative p-4 bg-white rounded-lg dark:bg-gray-800 sm:p-5'>
            <div class='flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600'>
              <h3 class='text-lg font-semibold text-gray-900 dark:text-white'>
                Dodaj zwierzę
              </h3>
              <a
                href='/'
                class='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white'
                data-modal-toggle='defaultModal'
              >
                <svg
                  aria-hidden='true'
                  class='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fill-rule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clip-rule='evenodd'
                  ></path>
                </svg>
                <span class='sr-only'>Close modal</span>
              </a>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const formProps = Object.fromEntries(
                  formData
                ) as unknown as SendData;
                sendData(formProps, navigate);
              }}
            >
              <input
                type='hidden'
                name='lat'
                value={location() ? location()[0] : -1}
              />
              <input
                type='hidden'
                name='lon'
                value={location() ? location()[1] : -1}
              />
              <div class='grid gap-4 justify-center mb-4 sm:grid-cols-2'>
                <div class='w-full grid gap-2'>
                  <div class='h-24 cursor-pointer relative flex justify-center items-center border-2 rounded-md bg-gray-200'>
                    <input
                      type='file'
                      accept='image/png, image/gif, image/jpeg'
                      name='photo'
                      ref={fileInput}
                      onChange={imageHandler}
                      class='z-20 opacity-0 cursor-pointer h-full w-full'
                    />
                    <div class='absolute flex justify-center items-center gap-2'>
                      <img
                        class={`h-10 w-10 rounded-full ${
                          checkFile() ? 'opacity-1' : 'opacity-0'
                        }`}
                        src={
                          selectedFile()
                            ? URL.createObjectURL(selectedFile())
                            : null
                        }
                      />
                      <span class='text-[18px] w-56 truncate'>
                        {checkFile() ? selectedFile().name : 'Wybierz zdjęcie'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    for='category'
                    class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                  >
                    Gatunek
                  </label>
                  <Select
                    {...selectOptions}
                    name='species'
                    emptyPlaceholder='Nie znaleziono'
                    placeholder='Wybierz gatunek'
                    loadingPlaceholder='Ładowanie...'
                    onChange={(value) => setSelected(value)}
                    id='category'
                  />
                </div>
                <Suspense>
                  <Show when={currentAnimal()}>
                    <Show when={currentAnimal().imageUrl}>
                      <img
                        class='rounded-md'
                        src={`${API_URL}/${currentAnimal().imageUrl}`}
                      />
                    </Show>
                    <p class='text-xs'>
                      {currentAnimal() && currentAnimal().desription}
                    </p>
                  </Show>
                </Suspense>
                <Show when={canAdd()}>
                  <div class='flex gap-3 justify-between'>
                    <div class='flex items-center'>
                      <input
                        name='dead'
                        id='default-checkbox'
                        type='checkbox'
                        value=''
                        class='w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                      />
                      <label
                        for='default-checkbox'
                        class='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                      >
                        Nieżywe
                      </label>
                    </div>
                    <div class='flex items-center'>
                      <input
                        name='road'
                        id='default-checkbox'
                        type='checkbox'
                        value=''
                        class='w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                      />
                      <label
                        for='default-checkbox'
                        class='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                      >
                        W pobliżu drogi
                      </label>
                    </div>
                  </div>
                  <div class='sm:col-span-2'>
                    <label
                      for='description'
                      class='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
                    >
                      Spostrzeżenia
                    </label>
                    <textarea
                      name='description'
                      id='description'
                      rows='4'
                      class='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500'
                      placeholder='Wypisz tutaj swoje spostrzeżenia'
                    ></textarea>
                  </div>
                  <button
                    type='submit'
                    class='text-white inline-flex items-center bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
                  >
                    <svg
                      class='mr-1 -ml-1 w-6 h-6'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        fill-rule='evenodd'
                        d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
                        clip-rule='evenodd'
                      ></path>
                    </svg>
                    Dodaj
                  </button>
                </Show>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
