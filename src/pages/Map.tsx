import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_KEY } from '../utils/googleMap';

let cachedScripts: any = [];

function useScript(src: string) {
  // Keeping track of script loaded and error state
  const [state, setState] = useState({
    loaded: false,
    error: false,
  });

  useEffect(
    () => {
      // If cachedScripts array already includes src that means another instance of this hook already loaded this script, so no need to load again.
      if (cachedScripts.includes(src)) {
        setState({
          loaded: true,
          error: false,
        });
      } else {
        cachedScripts.push(src);
        // Create script
        let script = document.createElement('script');
        script.src = src;
        script.async = true;
        // Script event listener callbacks for load and error
        const onScriptLoad = () => {
          setState({
            loaded: true,
            error: false,
          });
        };

        const onScriptError = () => {
          // Remove from cachedScripts we can try loading again
          const index = cachedScripts.indexOf(src);
          if (index >= 0) {
            cachedScripts.splice(index, 1);
          }
          script.remove();
          setState({
            loaded: true,
            error: true,
          });
        };
        script.addEventListener('load', onScriptLoad);
        script.addEventListener('error', onScriptError);
        // Add script to document body
        document.body.appendChild(script);
        // Remove event listeners on cleanup
        return () => {
          script.removeEventListener('load', onScriptLoad);
          script.removeEventListener('error', onScriptError);
        };
      }
    },
    [src] // Only re-run effect if script src changes
  );
  return [state.loaded, state.error];
}

function Map(): JSX.Element {
  const [loaded, error] = useScript(`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`);
  const [map, setDataMap] = useState();
  const [from, setFrom] = useState('');

  useEffect(() => {
    if (loaded) {
      const map: any = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
        // zoom: 20,
        zoom: 4,
        // center: { lat: 25.033964, lng: 121.564468 },
        center: { lat: 49.496675, lng: -102.65625 },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      });

      // kml layer
      const georssLayer = new google.maps.KmlLayer({
        //kmz
        // url: 'https://drive.google.com/file/d/1xMBqsavo9-1HHYCYioSDWEAfKH8Y2VGm/view?usp=share_link',
        //kml
        // url: 'https://www.google.com/maps/d/kml?forcekml=1&mid=1GhN4TqqpphS-XgYKpYEi3krVGKtHYTQ',
        //一沐日
        url: `https://www.google.com/maps/d/kml?forcekml=1&mid=1GhN4TqqpphS-XgYKpYEi3krVGKtHYTQ&lid=cFBv7lS5xo0`,
        // url: "http://api.flickr.com/services/feeds/geo/?g=322338@N20&lang=en-us&format=feed-georss",
      });
      georssLayer.setMap(map);

      setDataMap(map);

    }
  }, [loaded]);

  if (!loaded) {
    return <></>;
  }

  function calcRoute() {
    //create request
    const request = {
      origin: from,
      destination: 'AppWorks School',
      travelMode: window.google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
      unitSystem: window.google.maps.UnitSystem.METRIC,
    };

    // directionsService.route(request, function (result, status) {
    //   console.log(status);
    //   if (status == window.google.maps.DirectionsStatus.OK) {
    //     // directionsDisplay.setDirections(result);
    //     console.log(result);
    //   } else {
    //     //delete route from map
    //     // directionsDisplay.setDirections({ routes: [] });
    //     //center map in London
    //     map.setCenter({ lat: 25.033964, lng: 121.564468 });
    //     //show error message
    //   }
    // });
  }

  return (
    <>
      <div>
        <div>
          {/*<button onClick={() => calcRoute()}>點我去試穿</button>*/}
          <Link to='/'>回首頁</Link>
        </div>
        <div>
          <div id='map' style={{ height: '550px', width: '1280px', border: `3px solid #BDB0A4` }} />
        </div>
        <iframe
          src='https://www.google.com/maps/d/embed?mid=1GhN4TqqpphS-XgYKpYEi3krVGKtHYTQ&ehbc=2E312F'
          width='640'
          height='480'
        ></iframe>
      </div>
    </>
  );
}
export default Map;
