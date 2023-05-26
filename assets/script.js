// Keys to be attached to get the response from Marvel server
const publicKey = "14d27cc0e17db4c46e2a1c8c038702f8";
const privateKey = "dd786203735e0d58df194e5f71e0a50fbc7df72a";
const apiUrl = "https://gateway.marvel.com:443/v1/public/characters?";

// HTML element for spinner
const spinner = document.getElementById("spinner");

// Fetch data from Marvel server
async function fetchData(nameStartsWith) {
  const ts = Date.now();
  const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();
  const url = `${apiUrl}ts=${ts}&apikey=${publicKey}&hash=${hash}&nameStartsWith=${nameStartsWith}`;

  // Show spinner
  spinner.classList.remove("hidden");

  // Fetch data from the url, process json and update page elements
  const response = await fetch(url);
  const data = await response.json();

  let heroName = document.getElementById("name");
  let description = document.getElementById("description");
  let thumbnail = document.getElementById("thumbnail");

  // Set the name, description, and thumbnail elements
  heroName.textContent = data.data.results[0].name;

  // Convert description to Pirate Language
  let pirateDescription = await convertToPirateLanguage(
    data.data.results[0].description
  );
  description.textContent = pirateDescription;

  thumbnail.src =
    data.data.results[0].thumbnail.path +
    "." +
    data.data.results[0].thumbnail.extension;

  // Call eyecolor function to get the eye color of the superhero and change the border of the image to that color
  await getEyeColor(nameStartsWith);

  // Hide spinner
  spinner.classList.add("hidden");
}

// Function to convert text to Pirate Language using OpenAI
async function convertToPirateLanguage(pDescription) {
  const openKey = "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";
  const endpoint = "https://api.openai.com/v1/completions";

  const payload = {
    model: "text-davinci-003",
    prompt:
      "Translate the following character description into a witty and clever pirate language:\n\n" +
      pDescription +
      "\n\nRemember to use pirate slang, humor, and wordplay to make it sound like an entertaining pirate's tale.",
    temperature: 0.3,
    max_tokens: 100,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openKey}`,
    },
    body: JSON.stringify(payload),
  });

  const openaiData = await response.json();
  return openaiData.choices[0].text;
}

// Function to get the hero's eye color and change the style elements on the page based on the result
async function getEyeColor(heroName) {
  const key = "110595011943951";
  const url = `https://www.superheroapi.com/api.php/${key}/search/${heroName}`;

  const response = await fetch(url);
  const data = await response.json();

  if (
    data.results &&
    data.results.length > 0 &&
    data.results[0].appearance &&
    data.results[0].appearance["eye-color"]
  ) {
    const eyeColor = data.results[0].appearance["eye-color"];
    const app = document.querySelector(".app");
    app.style.backgroundColor = eyeColor;
  }
}

// Reset background image and color of the .app element
function resetAppBackground() {
  const app = document.querySelector(".app");
  app.style.backgroundImage = "none";
  app.style.backgroundColor = "";
}

// Get a reference to the search input element
const searchInput = document.getElementById("heroName");

// Call fetchData function when the button is clicked
document.getElementById("button").addEventListener("click", function (event) {
  const name = document.getElementById("heroName").value;
  fetchData(name);
  event.preventDefault();
  saveToStorage(name);
  // Clear search input
  document.getElementById("heroName").value = "";
});

// Reset search input
$("#heroName").val("");

// Save search to local storage
var saveToStorage = function (newHero) {
  console.log("Saving to storage!");
  console.log("newHero: ", newHero);
  var savedSearchHistory =
    JSON.parse(localStorage.getItem("savedSearches")) || [];
  if (savedSearchHistory.includes(newHero)) {
    return;
  }
  savedSearchHistory.push(newHero);
  console.log("savedSearchHistory: ", savedSearchHistory);
  localStorage.setItem("savedSearches", JSON.stringify(savedSearchHistory));
  loadStorage();
};

// Local Storage on load
function loadStorage() {
  let savedSearches = JSON.parse(localStorage.getItem("savedSearches") || "[]");
  let listHolder = document.querySelector(".listHolder");
  listHolder.innerHTML = "";

  // Loop through the saved searches and add each one to the listHolder element
  savedSearches.forEach((search) => {
    let listItem = document.createElement("div");
    listItem.innerHTML = search;
    listHolder.appendChild(listItem);
  });

  // Added a clear button to clear search history stored in local storage
  let clearButton = document.createElement("button");
  clearButton.className = "button is-small is-warning is-outlined";
  clearButton.innerHTML = "Clear Searches";
  clearButton.addEventListener("click", function () {
    localStorage.removeItem("savedSearches");
    listHolder.innerHTML = "";
  });
  listHolder.appendChild(clearButton);
}

// Called when a search history entry is clicked
$(".listHolder").on("click", "div", function () {
  // Get text (hero name) of entry and pass it as a parameter to display hero details
  var previousSearchName = $(this).text();
  fetchData(previousSearchName);
});

loadStorage();
