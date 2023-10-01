import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors'
import bot from 'nodemw'
import {species} from "./species.js";
import fs from 'fs';
import multer from "multer";
import { v4 } from 'uuid';

import pkg from 'pg';

const {Client} = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'gwizd',
  user: 'postgres',
  password: 'postgres',
})


function subtractMonths(date, months) {
  date.setMonth(date.getMonth() - months);
  return date;
}
function subtractDays(date, days) {
  date.setDate(date.getDate() - days);
  return date;
}

function getRandomDate() {
    const fromTime = subtractMonths(new Date(), 2)
    const toTime = subtractDays(new Date(), 1);
    console.log(fromTime, toTime)
    return new Date(fromTime.getTime() + Math.random() * (toTime.getTime() - fromTime.getTime()));
}


console.log(getRandomDate().getTime())
var app = express();
app.use(cors());
var jsonParser = bodyParser.json()
app.use(express.static('public'))
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    console.log(file, v4() + "." + file.originalname.split('.').pop())
    cb(null, v4() + "." + file.originalname.split('.').pop());
  }
})

const upload = multer({ storage: storage, });

app.get('/places', jsonParser, async (req, res) => {
  const result = await client.query(`
        select id, ST_X(coords) as lon, ST_Y(coords) as lat, species, "photoUrl", "createdDate", description, road, dead from public.data`, [])
  res.send(JSON.stringify(result.rows));
});

app.get('/species', async (req, res) => {
  res.send(species);
});
app.get('/species/:species', async (req, res) => {
  console.log(req.params)
   let desc = fs.existsSync(`./public/species/${req.params.species}.txt`) ? fs.readFileSync(`./public/species/${req.params.species}.txt`, 'utf-8') : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis porttitor, neque sed dapibus ornare, dolor lacus viverra augue, ac cursus libero odio ac dui. Etiam mattis, arcu sed dapibus sagittis, ipsum turpis rhoncus diam, sit amet sollicitudin risus libero quis mauris. Vestibulum fringilla semper tortor, non viverra urna maximus quis. Proin nec turpis non libero aliquet sagittis. Duis efficitur diam eu velit auctor sagittis. Vivamus egestas blandit vehicula. Duis gravida porttitor tortor vitae euismod."
  if (fs.existsSync(`./public/species/${req.params.species}.jpg`)) {
    res.send({
      imageUrl: `species/${req.params.species}.jpg`,
      desription: desc
    });
  } else if (species.includes(req.params.species)){
    res.send({
      imageUrl: null,
      desription: desc
    });
  } else {
        res.send({
      imageUrl: null,
      desription: null,
    });
  }
});

app.post('/add', upload.single('photo'), async (req, res) => {
  console.log(req.file)
  await client.query(`
insert into data(coords, species, "photoUrl", "createdDate", description, road, dead)
values (geometry(point($1::float, $2::float)), $3::text, $4::text, $8::timestamp, $5::text, $6::bool, $7::bool)`,
    [parseFloat(req.body.lon), parseFloat(req.body.lat), req.body.species, req.file?.filename, req.body.description, (/true/).test(req.body.road), (/true/).test(req.body.dead), getRandomDate().toISOString()])
  res.sendStatus(200);
});

function random(max) {
  return Math.floor(Math.sqrt(Math.random()*max))
}

app.listen(9000, async function () {
  await client.connect()
  for (let i = 0; i< 1000; i++){
    let spec =
      species[random(species.length)]
    await client.query(`
insert into data(coords, species, "photoUrl", "createdDate", description, road, dead)
values (geometry(point($1::float, $2::float)), $3::text, $4::text, $8::timestamp, $5::text, $6::bool, $7::bool)`,
    [
      20.0850 - .5 + Math.random(),
      49.9347 - .25 + Math.random()*.5,
      spec,
      fs.existsSync(`./public/species/${spec}.jpg`) ? `species/${spec}.jpg`: "",
      "Lorem ipsum dolor sit amet, consectetur adip",
      Math.random() > .7,
      Math.random() > .92,
      getRandomDate().toISOString()
    ])
  }

  console.log('Example app listening on port 9000!');
});

process.on('SIGTERM', async () => {
  debug('SIGTERM signal received: closing HTTP server')
  await client.end()
  server.close(() => {
    debug('HTTP server closed')
  })
})
