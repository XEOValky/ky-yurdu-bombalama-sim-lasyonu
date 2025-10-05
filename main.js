var map = L.map('map').setView([51.505, -0.09], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let diameterInput = document.getElementById('diameter');
let velocityInput = document.getElementById('velocity');
let diameterValue = document.getElementById('diameterValue');
let velocityValue = document.getElementById('velocityValue');
let resultsDiv = document.getElementById('results');

diameterInput.oninput = () => {
    diameterValue.innerText = diameterInput.value;
};

velocityInput.oninput = () => {
    velocityValue.innerText = velocityInput.value;
};

// Basit çarpışma hesaplama fonksiyonu
function calculateImpact(diameter, velocity) {
    const blastRadius = diameter * velocity * 0.05; // km
    const fireballRadius = diameter * velocity * 0.02; // km
    const airburstHeight = diameter * 0.1; // km
    return { blastRadius, fireballRadius, airburstHeight };
}

// Haritada tıklama ile çarpışma yarat
map.on('click', function(e) {
    let diameter = parseFloat(diameterInput.value);
    let velocity = parseFloat(velocityInput.value);
    let impact = calculateImpact(diameter, velocity);

    let circle = L.circle(e.latlng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.3,
        radius: impact.blastRadius * 1000
    }).addTo(map);

    let fireballCircle = L.circle(e.latlng, {
        color: 'orange',
        fillColor: '#ffa500',
        fillOpacity: 0.2,
        radius: impact.fireballRadius * 1000
    }).addTo(map);

    resultsDiv.innerHTML = `
        <h3>Çarpışma Sonuçları</h3>
        <p>Blast Radius: ${impact.blastRadius.toFixed(2)} km</p>
        <p>Fireball Radius: ${impact.fireballRadius.toFixed(2)} km</p>
        <p>Airburst Height: ${impact.airburstHeight.toFixed(2)} km</p>
    `;
});


// 🚀 NASA NEO API ENTEGRASYONU — burası doğru yerdir 👇
const API_KEY = 'DEMO_KEY'; // Buraya kendi API anahtarını koyabilirsin

fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${API_KEY}`)
.then(res => res.json())
.then(data => {
    data.near_earth_objects.forEach(neo => {
        // NEO'ların çoğunda koordinat verisi yok, bu yüzden geçici olarak rastgele yer veriyoruz
        let lat = Math.random() * 180 - 90;
        let lng = Math.random() * 360 - 180;

        let diameter = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(1);

        L.marker([lat, lng])
         .addTo(map)
         .bindPopup(`
            <b>${neo.name}</b><br>
            Diameter: ${diameter} m<br>
            Hazardous: ${neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
         `);
    });
})
.catch(err => console.error('NEO API error:', err))