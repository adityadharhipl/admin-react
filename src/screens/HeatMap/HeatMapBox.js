import React, { useEffect } from 'react';

function HeatMapBox() {
  useEffect(() => {
    // Initialize the map when the component is mounted
    function initMap() {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 37.775, lng: -122.434 },
        mapTypeId: 'satellite',
      });

      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map,
      });

      document.getElementById('toggle-heatmap').addEventListener('click', () => {
        heatmap.setMap(heatmap.getMap() ? null : map);
      });

      document.getElementById('change-gradient').addEventListener('click', () => {
        const gradient = [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)',
        ];
        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
      });

      document.getElementById('change-radius').addEventListener('click', () => {
        heatmap.set('radius', heatmap.get('radius') ? null : 20);
      });

      document.getElementById('change-opacity').addEventListener('click', () => {
        heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
      });
    }

    // Load the Google Maps script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&libraries=visualization&v=weekly`;
    script.defer = true;
    document.head.appendChild(script);

    window.initMap = initMap;

    return () => {
      // Clean up the script on unmount
      document.head.removeChild(script);
    };
  }, []);

  function getPoints() {
    return [
      new window.google.maps.LatLng(37.782551, -122.445368),
      new window.google.maps.LatLng(37.782745, -122.444586),
      new window.google.maps.LatLng(37.782842, -122.443688),
      new window.google.maps.LatLng(37.782919, -122.442815),
      new window.google.maps.LatLng(37.782992, -122.442112),
      new window.google.maps.LatLng(37.7831, -122.441461),
      // Add more points here
      new window.google.maps.LatLng(37.750448, -122.444013),
      new window.google.maps.LatLng(37.750536, -122.44404),
      new window.google.maps.LatLng(37.751266, -122.403355),
    ];
  }

  return (
    <div>
      <div className='d-flex gap-2 mb-2' id="floating-panel">
        <button className='btn btn-primary btn-set-task' id="toggle-heatmap">Toggle Heatmap</button>
        <button className='btn btn-primary btn-set-task' id="change-gradient">Change Gradient</button>
        <button className='btn btn-primary btn-set-task' id="change-radius">Change Radius</button>
        <button className='btn btn-primary btn-set-task' id="change-opacity">Change Opacity</button>
      </div>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
}

export default HeatMapBox;
