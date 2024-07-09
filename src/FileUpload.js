// FileUpload.js

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useDropzone } from 'react-dropzone';
import * as L from 'leaflet';

const FileUpload = () => {
  const [gpxData, setGpxData] = useState(null);
  const [json, setJson] = useState(null);
  const [mapOff, setMapOff] = useState(true);

  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.onload = () => {
      const gpxContent = reader.result;
      parseGPX(gpxContent);
    };
    reader.readAsText(acceptedFiles[0]);
  };

  const parseGPX = (gpxContent) => {
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxContent, 'text/xml');
    const tracks = gpxDoc.getElementsByTagName('trkpt');

    // Extracting coordinates from GPX
    const markers = Array.from(tracks).map(track => {
      const lat = track.getAttribute('lat');
      const lon = track.getAttribute('lon');
      return L.latLng(parseFloat(lat), parseFloat(lon));
    });

    // Convert GPX data to string for textarea
    const gpxString = new XMLSerializer().serializeToString(gpxDoc);
    setGpxData({ markers, gpxString });

    // Convert GPX data to JSON
    const jsonData = {
      tracks: Array.from(tracks).map(track => ({
        lat: parseFloat(track.getAttribute('lat')),
        lon: parseFloat(track.getAttribute('lon'))
      }))
    };
    setJson(JSON.stringify(jsonData, null, 2)); // Pretty print JSON with 2 spaces indentation
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="file-upload">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>Drag & drop or click to select GPX file</p>
      </div>
      {gpxData && !mapOff && (
        <>
          <MapContainer center={gpxData.markers[0]} zoom={13} style={{ height: '400px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={gpxData.markers} color="blue" />
            {gpxData.markers.map((position, index) => (
              <Marker key={index} position={position}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
      {gpxData && (
        <div className="gpx-text">
          <h2>GPX Code</h2>
          <textarea
            rows={10}
            value={gpxData.gpxString}
            readOnly
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      )}
      {json && (
        <div className="gpx-text">
          <h2>JSON Code</h2>
          <textarea
            rows={10}
            value={json}
            readOnly
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
