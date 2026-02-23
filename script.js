// === CONFIG ===
const apiKey = "MY_KEY";
const useProxy = true;
const proxy = "https://cors-anywhere.herokuapp.com";

let savedCafes = [];

// === KONUM AL (CACHE + GEOLOCATION) ===
function getLocation() {
  const cache = JSON.parse(localStorage.getItem("cachedLocation") || "{}");
  const now = Date.now();

  // 10 dakika cache kontrolü
  if (cache.timestamp && now - cache.timestamp < 10 * 60 * 1000) {
    useLocation(cache.lat, cache.lng);
  } else {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        localStorage.setItem(
          "cachedLocation",
          JSON.stringify({ lat, lng, timestamp: now })
        );

        useLocation(lat, lng);
      },
      () => alert("Location access denied or unavailable.")
    );
  }
}

// === GOOGLE PLACES API ===
async function useLocation(lat, lng) {
  const endpoint = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=cafe&key=${apiKey}`;
  const url = useProxy ? proxy + "/" + endpoint : endpoint;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("API DATA:", data); // BUNA BAK

    if (data.results && data.results.length > 0) {
      displayCafes(data.results);
    } else {
      alert("No cafes found.");
    }
  } catch (e) {
    console.error("Error fetching Places API:", e);
  }
}

// === KARTLARI GÖSTER ===
function displayCafes(cafes) {
  const container = document.querySelector(".cards");
  container.innerHTML = "";

  // İlk 5 kafeyi al
  const list = cafes.slice(0, 5);

  list.forEach((cafe, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "swipe-wrapper";

    // Kartların üst üste ama görünür olması için offset
    wrapper.style.top = `${index * 8}px`;
    wrapper.style.zIndex = list.length - index;

    const card = document.createElement("div");
    card.className = "location-card";

    // Fotoğraf kontrolü
    const photoRef = cafe.photos?.[0]?.photo_reference;
    const imageUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`
      : "";

    card.innerHTML = `
      ${imageUrl ? `<img src="${imageUrl}" alt="${cafe.name}" />` : ""}
      <h3>${cafe.name}</h3>
      <p>${cafe.vicinity || ""}</p>
      <p>⭐ ${cafe.rating || "N/A"}</p>
    `;

    wrapper.appendChild(card);
    container.appendChild(wrapper);

    // Swipe ekle
    addSwipe(wrapper, cafe);
  });
}

// === SWIPE (Hammer.js) ===
function addSwipe(element, cafe) {
  const hammer = new Hammer(element);

  hammer.on("swipeleft", () => {
    element.style.transform = "translateX(-400px)";
    element.style.opacity = 0;
  });

  hammer.on("swiperight", () => {
    savedCafes.push(cafe);
    element.style.transform = "translateX(400px)";
    element.style.opacity = 0;
  });
}

// === KAYDEDİLEN CAFELER ===
function showSaved() {
  const container = document.querySelector(".cards");
  container.innerHTML = "<h2>Saved Cafes</h2>";

  savedCafes.forEach(cafe => {
    const card = document.createElement("div");
    card.className = "location-card";

    card.innerHTML = `
      <h3>${cafe.name}</h3>
      <p>${cafe.vicinity || ""}</p>
      <p>⭐ ${cafe.rating || "N/A"}</p>
    `;

    container.appendChild(card);
  });
}