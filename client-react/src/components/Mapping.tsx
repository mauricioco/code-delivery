import { Button, Grid, MenuItem, Select } from '@material-ui/core';
import { Loader } from 'google-maps';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentPosition } from '../util/geoloaction';
import { Route } from '../util/models';

const EMPTY_STRING = "";
const API_URL = process.env.REACT_APP_API_URL;

const googleMApsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

type Props = {};
export const Mapping = (props: Props) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>(EMPTY_STRING);
  const mapRef = useRef<google.maps.Map>();


  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then(data => data.json())
      .then(data => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      const [_, position] = await Promise.all([
        googleMApsLoader.load(),
        getCurrentPosition({enableHighAccuracy: true})
      ]);
      const divMap = document.getElementById('map') as HTMLElement;
      mapRef.current = new google.maps.Map(divMap, {
        zoom: 15,
        center: position
      });
    })();
  }, []);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    console.log(routeIdSelected);
  }, [routeIdSelected]);

  return (
    <Grid container style={{width: '100%', height: '100%'}}>
      <Grid item xs={12} sm={3}>
        <form onSubmit={startRoute}>
          <Select 
            fullWidth
            displayEmpty
            value={routeIdSelected} 
            onChange={(event) => setRouteIdSelected(event.target.value as string)}
          >
            <MenuItem value="">
              <em>Selecione uma corrida</em>
            </MenuItem>
            {routes.map((route, key) => (
              <MenuItem key={key} value={route._id}>
                {route.title}
              </MenuItem>
            ))}
          </Select>
          <Button type="submit" color="primary" variant="contained">Iniciar uma corrida</Button>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" style={{width: '100%', height: '100%'}}></div>
      </Grid>
    </Grid>
  );
};