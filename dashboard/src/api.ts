import axios from 'axios';

export const URL = 'http://192.168.127.203:9000';

export interface Report {
  id: number;
  description: string;
  lon: number;
  lat: number;
  photoUrl: string;
  road: boolean;
  species: string;
  createdDate: string;
  dead: boolean;
}

export async function loadReports(): Promise<Report[]> {
  return axios(URL + '/places').then((res) => res.data);
}

export async function loadSpecies(): Promise<string[]> {
  return axios(URL + '/species').then((res) => res.data.sort());
}
