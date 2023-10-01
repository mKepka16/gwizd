<script lang="ts">
  import axios from 'axios';
  import Chart from 'chart.js/auto';
  import { format, subMonths, parse } from 'date-fns';
  import { onMount } from 'svelte';
  import { loadReports, loadSpecies } from '../../api';
  import type { Report } from '../../api';

  let mainChart: HTMLCanvasElement;
  let species: string[] = [];
  let reports: Report[] = [];

  onMount(async () => {
    species = await loadSpecies();
    reports = await loadReports();
  });

  let dateFrom = format(subMonths(Date.now(), 1), 'yyyy-MM-dd');
  let dateTo = format(Date.now(), 'yyyy-MM-dd');
  let animalState: string = 'all';
  let animalPlace: string = 'all';
  let allSpeciesSelected: boolean = true;
  let selectedSpecies: string[] = [];

  $: {
    const dateFromObj = parse(dateFrom, 'yyyy-MM-dd', new Date());
    const dateToObj = parse(dateTo, 'yyyy-MM-dd', new Date());
    const shouldCheckAnimalState = animalState !== 'all';
    const isAnimalDead = animalState === 'dead';
    const shouldCheckAnimalPlace = animalPlace !== 'all';
    const isAnimalNearRoad = animalPlace === 'road';

    const shouldCheckSpecies = !allSpeciesSelected;

    console.log({
      dateFromObj,
      dateToObj,
      shouldCheckAnimalState,
      isAnimalDead,
      shouldCheckAnimalPlace,
      isAnimalNearRoad,
      shouldCheckSpecies,
      reports,
    });
    const filteredReports = reports.filter((report) => {
      if (shouldCheckAnimalPlace && isAnimalNearRoad !== report.road)
        return false;
      if (shouldCheckAnimalState && isAnimalDead !== report.dead) return false;

      if (shouldCheckSpecies && !selectedSpecies.includes(report.species))
        return false;

      if (dateFromObj.getTime() > new Date(report.createdDate).getTime())
        return false;

      if (dateToObj.getTime() < new Date(report.createdDate).getTime())
        return false;

      return true;
    });

    const groupedReports: Record<string, number> = {};
    filteredReports.forEach((report) => {
      if (groupedReports[report.species] === undefined)
        groupedReports[report.species] = 1;
      else groupedReports[report.species]++;
    });

    console.log({ filteredReports, groupedReports });
    const entries: [string, number][] = Object.entries(groupedReports);
    entries.sort((a, b) => b[1] - a[1]);
    console.log(entries);
    entries.splice(10);

    initMainChart(entries);
  }

  let chart: Chart;

  function initMainChart(groupedReports: [string, number][]) {
    if (!mainChart) return;
    if (chart) chart.destroy();

    chart = new Chart(mainChart, {
      type: 'bar',
      data: {
        labels: groupedReports.map((report) => report[0]),
        datasets: [
          {
            label: 'Ilość zgłoszeń',

            data: groupedReports.map((report) => report[1]),
            backgroundColor: [
              'dodgerblue',
              '#c7ea46',
              '#704214',
              '#ffe41e',
              'tomato',
              '#fa86c4',
              '#8f00ff',
              '#ff0800',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              boxHeight: 0,
              boxWidth: 0,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
</script>

<div class="p-10">
  <h1 class="h2 mb-10">Statystyki</h1>

  <div class="flex">
    <div class="flex flex-col basis-52 mr-8">
      <label class="my-3">
        <span class="ml-2 block mb-2">Przedział czasu</span>
        <input
          class="input w-40 mr-2 mb-3"
          type="date"
          placeholder="Input"
          bind:value={dateFrom}
        />
        <input
          class="input w-40 block"
          type="date"
          placeholder="Input"
          bind:value={dateTo}
        />
      </label>

      <label class="label my-3">
        <span class="ml-2">Gatunki</span>

        <label class="flex items-center space-x-2 py-2">
          <input
            class="checkbox"
            type="checkbox"
            bind:checked={allSpeciesSelected}
          />
          <p>Wszystkie</p>
        </label>

        <select
          disabled={allSpeciesSelected}
          class="select w-40"
          size={10}
          multiple
          bind:value={selectedSpecies}
        >
          {#each species as specie}
            <option value={specie}>{specie}</option>
          {/each}
        </select>
      </label>

      <label class="label my-3">
        <span class="ml-2">Stan zwierzęcia</span>

        <select class="select w-40" bind:value={animalState}>
          <option value="all">Wszystkie</option>
          <option value="alive">Żywe</option>
          <option value="dead">Nieżywe</option>
        </select>
      </label>

      <label class="label my-3">
        <span class="ml-2">Miejsce zwierzęcia</span>

        <select class="select w-40" bind:value={animalPlace}>
          <option value="all">Wszystkie</option>
          <option value="road">Przy drodzę</option>
          <option value="away">Z dala od drogi</option>
        </select>
      </label>
    </div>
    <div class="flex-1">
      <canvas bind:this={mainChart} />
    </div>
  </div>
</div>
