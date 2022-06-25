import { Button, Grid, makeStyles, MenuItem, Select } from '@material-ui/core';
import { Loader } from 'google-maps';
import { FormEvent, FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentPosition } from '../util/geoloaction';
import { makeCarIcon, makeMarkerIcon, Map } from '../util/map';
import { Route } from '../util/models';
import { sample, shuffle } from 'lodash';
import { RouteExistsError } from '../errors/route-exists.error';
import { useSnackbar } from 'notistack';
import { Navbar } from './Navbar';
import { io, Socket } from 'socket.io-client'

const EMPTY_STRING = '';
const API_URL = process.env.REACT_APP_API_URL as string;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL as string;

const googleMApsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

// Material UI Colors
const colors = [
  '#b71c1c',
  '#4a148c',
  '#2e7d32',
  '#e65100',
  '#2962ff',
  '#c2185b',
  '#FFCD00',
  '#3e2723',
  '#03a9f4',
  '#827717',
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  form: {
    margin: '16px',
  },
  btnSubmitWrapper: {
    textAlign: 'center',
    marginTop: '8px',
  },
  map: {
    width: '100%',
    height: '100%',
  },
})

export const Mapping: FunctionComponent = (props) => {
  const classes = useStyles();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>(EMPTY_STRING);
  const mapRef = useRef<Map>();
  const socketIORef = useRef<Socket>();
  const {enqueueSnackbar} = useSnackbar();

  const finishRoute = useCallback((route: Route) => {
    enqueueSnackbar(`${route.title} finalizou!`, { variant: 'success' });
    mapRef.current?.removeRoute(route._id);
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!socketIORef.current?.connected) {
      socketIORef.current = io(SOCKET_URL);
      socketIORef.current.on('connect', () => console.log('Websocket conectado!'));
      socketIORef.current.on('connect_error', (error) => console.log(`Erro ao conectar ao Websocket... ${error.message}`));
    }
    const newPositionHandler = (data: {
      routeId: string; 
      position: [number, number],
      finished: boolean
    }) => {
      mapRef.current?.moveCurrentMarker(data.routeId, {lat: data.position[0], lng: data.position[1]});      
      if (data.finished) {
        const route = routes.find((r) => r._id === data.routeId) as Route;
        finishRoute(route);
      }
    };
    socketIORef.current?.on('new-position', newPositionHandler);
    return () => {
      socketIORef.current?.off('new-position', newPositionHandler);
    }
  }, [finishRoute, routes, routeIdSelected]);

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then(data => data.json())
      .then(data => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMApsLoader.load(),
        getCurrentPosition({enableHighAccuracy: true})
      ]);
      const divMap = document.getElementById('map') as HTMLElement;
      mapRef.current = new Map(divMap, {
        zoom: 15,
        center: position
      });
    })();
  }, []);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    const route = routes.find(r => r._id === routeIdSelected);
    const color = sample(shuffle(colors));

    try {
      mapRef.current?.addRoute(routeIdSelected, {
        currentMarkerOptions: {
          position: route?.startPosition,
          icon: makeCarIcon(color!),
        },
        endMarkerOptions: {
          position: route?.endPosition,
          icon: makeMarkerIcon(color!),
        },
      });
      socketIORef.current?.emit('new-direction', {
        routeId: routeIdSelected
      });
    } catch (error) {
      if (error instanceof RouteExistsError) {
        enqueueSnackbar(`${route?.title} já adicionado. Por favor, espere finalizar.`, {
          variant: 'error',
        })
      }
    }
  }, [routeIdSelected, routes, enqueueSnackbar]);

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} sm={3}>
        <Navbar />
        <form onSubmit={startRoute} className={classes.form}>
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
          <div className={classes.btnSubmitWrapper}>
            <Button type="submit" color="primary" variant="contained">Iniciar uma corrida</Button>
          </div>
        </form>
      </Grid>
      <Grid item xs={12} sm={9}>
        <div id="map" className={classes.map} />
      </Grid>
    </Grid>
  );
};