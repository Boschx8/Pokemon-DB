

document.querySelector('.type-filter').addEventListener('click', (event) =>  {
    event.preventDefault();
    document.querySelector('.type-button').classList.toggle('active');
    document.querySelector('.type-filter').classList.toggle('active');
});

document.querySelector('.gen-filter').addEventListener('click', (event) =>  {
    event.preventDefault();
    document.querySelector('.gen-button').classList.toggle('active');
    document.querySelector('.gen-filter').classList.toggle('active');
});




// All pokemos fetched

const pokemonList = document.querySelector(".pokemon-list");
const URL = "https://pokeapi.co/api/v2/pokemon/";
const totalPokemon = 1025;



function fetchAllPokemon() {
    let pokemonPromises = [];

    for (let i = 1; i <= totalPokemon; i++) {
        pokemonPromises.push(
            fetch(URL + i)
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




function showPokemon(data){

    let types = data.types.map(type => 
        `<a class="${type.type.name}">${type.type.name}</a>`
    );
    types = types.join('')
    
    let pokeId = data.id.toString();
    if(pokeId.length === 1){
        pokeId = "00" + pokeId;
    } else if (pokeId.length === 2) {
        pokeId = "0" + pokeId;
    }

    pokemonName = data.name
    pokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)
    pokemonName = pokemonName.replace('-', ' ');

    let defaultImageSrc = data.sprites.other["official-artwork"].front_default;
    let hoverImageSrc = data.sprites.other.showdown?.front_default || defaultImageSrc;

    const div = document.createElement("div");
    div.classList.add("pokemon-card");
    div.setAttribute('data-type', data.types[0].type.name);
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

    pokemonList.append(div)
}

fetchAllPokemon()



// Search bar functionality
const searchInput = document.getElementById("search-bar");
const noResultsMessage = document.getElementById("noResultsMessage");

function searchPokemon() {
    let searchText = searchInput.value.toLowerCase().trim();
    let searchNumber = parseInt(searchText);

    let pokemonCards = document.querySelectorAll(".pokemon-card");
    let foundMatch = false;

    pokemonCards.forEach(card => {
        let pokeName = card.querySelector(".pokemon-name").textContent.toLowerCase();
        let pokeId = card.querySelector(".pokemon-id").textContent.replace('#', '');
        let pokeIdNumber = parseInt(pokeId);

        let nameMatch = pokeName.includes(searchText);
        let idMatch = !isNaN(searchNumber) && pokeIdNumber === searchNumber && searchNumber >= 1 && searchNumber <= totalPokemon;
        let searchMatch = nameMatch || idMatch;

       
        let passesFilters = checkFilters(card);

        if (searchMatch && passesFilters) {
            card.style.display = "flex";
            foundMatch = true;
        } else {
            card.style.display = "none";
        }
    });

    if(foundMatch) {
        noResultsMessage.style.display = "none";
    } else {
        noResultsMessage.style.display = "flex";
    }
}

searchInput.addEventListener('input', () => {
    searchPokemon();
    updateNoResultsMessage();
});


let currentTypeFilters = [];
let currentGenFilters = [];


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


document.querySelectorAll('.type-button button').forEach(button => {
    button.addEventListener('click', () => {
        const type = button.textContent.toLowerCase();
        if (currentTypeFilters.includes(type)) {
            currentTypeFilters = currentTypeFilters.filter(t => t !== type);
            button.classList.remove('active');
        } else {
            currentTypeFilters.push(type);
            button.classList.add('active');
        }
        applyFilters();
    });
});



// Modify the event listeners for generation buttons
document.querySelectorAll('.gen-button button').forEach(button => {
    button.addEventListener('click', () => {
        const gen = button.textContent.split(' ')[0].toLowerCase();
        if (currentGenFilters.includes(gen)) {
            currentGenFilters = currentGenFilters.filter(g => g !== gen);
            button.classList.remove('active');
        } else {
            currentGenFilters.push(gen);
            button.classList.add('active');
        }
        applyFilters();
    });
});


function checkFilters(card) {
    const cardTypes = card.getAttribute('data-type').split(',');
    const cardGen = card.getAttribute('data-gen');
    
    const typeMatch = currentTypeFilters.length === 0 || 
                      currentTypeFilters.some(type => cardTypes.includes(type));
    const genMatch = currentGenFilters.length === 0 || 
                     currentGenFilters.includes(cardGen);
    
    return typeMatch && genMatch;
}

// Function to apply filters
function applyFilters() {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    pokemonCards.forEach(card => {
        if (checkFilters(card)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    updateNoResultsMessage();
}

// Function to update the "No Results" message
function updateNoResultsMessage() {
    const visibleCards = document.querySelectorAll('.pokemon-card[style="display: flex;"]');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (visibleCards.length === 0) {
        noResultsMessage.style.display = 'flex';
    } else {
        noResultsMessage.style.display = 'none';
    }
}


// Get the button
let scrollToTopBtn = document.getElementById("scrollToTopBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopBtn.style.display = "flex";
  } else {
    scrollToTopBtn.style.display = "none";
  }
}

// Smooth scroll to the top when the button is clicked
scrollToTopBtn.onclick = function() {
  smoothScrollToTop();
};

function smoothScrollToTop() {
  const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;

  if (currentScroll > 0) {
    window.requestAnimationFrame(smoothScrollToTop);
    window.scrollTo(0, currentScroll - currentScroll / 8);
  }
}


