import { useState, useEffect } from 'react';

export default function TestMaps() {
  const [results, setResults] = useState({});
  
  const maps = [
    { name: 'Kanto', path: '/images/scraped/maps/PE_Kanto_Map.png' },
    { name: 'Johto', path: '/images/scraped/maps/JohtoMap.png' },
    { name: 'Hoenn', path: '/images/scraped/maps/Hoenn_ORAS.png' },
    { name: 'Sinnoh', path: '/images/scraped/maps/Sinnoh_BDSP_artwork.png' },
    { name: 'Unova', path: '/images/scraped/maps/Unova_B2W2_alt.png' },
    { name: 'Kalos', path: '/images/scraped/maps/Kalos_alt.png' },
    { name: 'Alola', path: '/images/scraped/maps/Alola_USUM_artwork.png' },
    { name: 'Galar', path: '/images/scraped/maps/Galar_artwork.png' },
    { name: 'Paldea', path: '/images/scraped/maps/Paldea_artwork.png' }
  ];

  useEffect(() => {
    // Test each map path
    maps.forEach(map => {
      fetch(map.path)
        .then(res => {
          setResults(prev => ({
            ...prev,
            [map.name]: {
              status: res.status,
              ok: res.ok,
              type: res.headers.get('content-type')
            }
          }));
        })
        .catch(err => {
          setResults(prev => ({
            ...prev,
            [map.name]: {
              status: 'error',
              error: err.message
            }
          }));
        });
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Map Image Test Page</h1>
      
      <h2>1. Direct Image Tags</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {maps.map(map => (
          <div key={map.name} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{map.name}</h3>
            <p>Path: {map.path}</p>
            <img 
              src={map.path} 
              alt={map.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              onLoad={(e) => console.log(`${map.name} loaded successfully`)}
              onError={(e) => console.error(`${map.name} failed to load`)}
            />
          </div>
        ))}
      </div>

      <h2>2. Fetch Test Results</h2>
      <pre>{JSON.stringify(results, null, 2)}</pre>

      <h2>3. Background Image Test</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        {maps.map(map => (
          <div 
            key={map.name}
            style={{ 
              border: '1px solid #ccc', 
              padding: '10px',
              height: '200px',
              backgroundImage: `url(${map.path})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <h3 style={{ background: 'white', display: 'inline-block', padding: '5px' }}>{map.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}