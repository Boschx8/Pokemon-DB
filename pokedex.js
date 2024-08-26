// Constants
const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon/";
const TOTAL_POKEMON = 1025;

// DOM Elements
const pokemonList = document.querySelector(".pokemon-list");
const searchInput = document.getElementById("search-bar");
const noResultsMessage = document.getElementById("noResultsMessage");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const typeFilterButton = document.querySelector('.type-filter');
const genFilterButton = document.querySelector('.gen-filter');

// State
let currentTypeFilters = [];
let currentGenFilters = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
searchInput.addEventListener('input', handleSearch);
scrollToTopBtn.onclick = smoothScrollToTop;
window.onscroll = handleScroll;

typeFilterButton.addEventListener('click', (event) => toggleFilter(event, '.type-button'));
genFilterButton.addEventListener('click', (event) => toggleFilter(event, '.gen-button'));

document.querySelectorAll('.type-button button').forEach(button => {
    button.addEventListener('click', () => toggleTypeFilter(button));
});

document.querySelectorAll('.gen-button button').forEach(button => {
    button.addEventListener('click', () => toggleGenFilter(button));
});

// Functions
function initializeApp() {
    fetchAllPokemon();
}

function fetchAllPokemon() {
    let pokemonPromises = [];

    for (let i = 1; i <= TOTAL_POKEMON; i++) {
        pokemonPromises.push(
            fetch(POKEMON_API_URL + i)
                .then(response => response.json())
                .catch(error => {
                    console.error(`Failed to fetch Pokémon #${i}:`, error);
                    return null;
                })
        );
    }

    Promise.all(pokemonPromises)
        .then(pokemonDataArray => {
            pokemonDataArray
                .filter(data => data !== null)
                .forEach(data => showPokemon(data));
        })
        .catch(error => console.error("Error in processing Pokémon data", error));
}

function showPokemon(data) {
    const types = data.types.map(type => 
        `<a class="${type.type.name}">${type.type.name}</a>`
    ).join('');
    
    const pokeId = formatPokemonId(data.id);
    const pokemonName = formatPokemonName(data.name);
    const defaultImageSrc = data.sprites.other["official-artwork"].front_default;
    const hoverImageSrc = data.sprites.other.showdown?.front_default || defaultImageSrc;

    const pokemonCard = createPokemonCard(pokeId, pokemonName, types, defaultImageSrc, hoverImageSrc, data);
    pokemonList.append(pokemonCard);
}

function formatPokemonId(id) {
    return id.toString().padStart(3, '0');
}

function formatPokemonName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
}

function createPokemonCard(pokeId, pokemonName, types, defaultImageSrc, hoverImageSrc, data) {
    const div = document.createElement("div");
    div.classList.add("pokemon-card");
    div.setAttribute('data-primary-type', data.types[0].type.name);
    div.setAttribute('data-type', data.types.map(type => type.type.name).join(','));
    div.setAttribute('data-gen', getGeneration(data.id));
    div.innerHTML = `
        <div class="card-info">
            <p class="pokemon-id">#${pokeId}</p>
            <p class="pokemon-name">${pokemonName}</p>
        </div>
        <div class="card-types">
            ${types}
        </div>
        <div class="pokemon-image-container">
            <img src="${defaultImageSrc}" alt="${data.name}" class="pokemon-image default-image">
            <img src="${hoverImageSrc}" alt="${data.name}" class="pokemon-image hover-image">
        </div>
        <img src="assets/hero-pokeball-3430739968171e9fe85357e4739be704.png" alt="" height="100px" class="pokeball-image">
    `;
    return div;
}

function getGeneration(id) {
    if (id <= 151) return 'kanto';
    if (id <= 251) return 'johto';
    if (id <= 386) return 'hoenn';
    if (id <= 493) return 'sinnoh';
    if (id <= 649) return 'unova';
    if (id <= 721) return 'kalos';
    if (id <= 809) return 'alola';
    if (id <= 905) return 'galar';
    if (id <= 1025) return 'paldea';
    return 'unknown';
}

function handleSearch() {
    const searchText = searchInput.value.toLowerCase().trim();
    const searchNumber = parseInt(searchText);
    let foundMatch = false;

    document.querySelectorAll(".pokemon-card").forEach(card => {
        const pokeName = card.querySelector(".pokemon-name").textContent.toLowerCase();
        const pokeId = card.querySelector(".pokemon-id").textContent.replace('#', '');
        const pokeIdNumber = parseInt(pokeId);

        const nameMatch = pokeName.includes(searchText);
        const idMatch = !isNaN(searchNumber) && pokeIdNumber === searchNumber && searchNumber >= 1 && searchNumber <= TOTAL_POKEMON;
        const searchMatch = nameMatch || idMatch;
        const passesFilters = checkFilters(card);

        if (searchMatch && passesFilters) {
            card.style.display = "flex";
            foundMatch = true;
        } else {
            card.style.display = "none";
        }
    });

    updateNoResultsMessage(foundMatch);
}

function toggleFilter(event, buttonSelector) {
    event.preventDefault();
    document.querySelector(buttonSelector).classList.toggle('active');
    event.currentTarget.classList.toggle('active');
}

function toggleTypeFilter(button) {
    const type = button.textContent.toLowerCase();
    if (currentTypeFilters.includes(type)) {
        currentTypeFilters = currentTypeFilters.filter(t => t !== type);
        button.classList.remove('active');
    } else {
        currentTypeFilters.push(type);
        button.classList.add('active');
    }
    applyFilters();
}

function toggleGenFilter(button) {
    const gen = button.textContent.split(' ')[0].toLowerCase();
    if (currentGenFilters.includes(gen)) {
        currentGenFilters = currentGenFilters.filter(g => g !== gen);
        button.classList.remove('active');
    } else {
        currentGenFilters.push(gen);
        button.classList.add('active');
    }
    applyFilters();
}

function checkFilters(card) {
    const cardTypes = card.getAttribute('data-type').split(',');
    const cardGen = card.getAttribute('data-gen');
    
    const typeMatch = currentTypeFilters.length === 0 || 
                      currentTypeFilters.some(type => cardTypes.includes(type));
    const genMatch = currentGenFilters.length === 0 || 
                     currentGenFilters.includes(cardGen);
    
    return typeMatch && genMatch;
}

function applyFilters() {
    let foundMatch = false;
    document.querySelectorAll('.pokemon-card').forEach(card => {
        if (checkFilters(card)) {
            card.style.display = 'flex';
            foundMatch = true;
        } else {
            card.style.display = 'none';
        }
    });
    updateNoResultsMessage(foundMatch);
}

function updateNoResultsMessage(foundMatch) {
    noResultsMessage.style.display = foundMatch ? 'none' : 'flex';
}

function handleScroll() {
    scrollToTopBtn.style.display = 
        (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) 
        ? "flex" 
        : "none";
}

function smoothScrollToTop() {
    const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

    if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScrollToTop);
        window.scrollTo(0, currentScroll - currentScroll / 8);
    }
}