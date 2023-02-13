const mobiles = [
    {
        id: 1,
        name: '4" Смартфон DEXP A440 8 ГБ розовый',
        image: 'assets/images/1.jpg',
        price: 3200,
        ram: 1,
        rom: 8,
        company: 'DEXP'
    },
    {
        id: 2,
        name: 'Samsung Galaxy M52',
        image: 'assets/images/2.jpg',
        price: 40999,
        ram: 6,
        rom: 256,
        company: 'Samsung'
    },
    {
        id: 3,
        name: 'Смартфон POCO F3 Черный',
        image: 'assets/images/3.jpg',
        price: 32999,
        ram: 6,
        rom: 128,
        company: 'POCO'
    },
    {
        id: 4,
        name: 'Смартфон POCO F3 Белый',
        image: 'assets/images/4.jpg',
        price: 34999,
        ram: 6,
        rom: 128,
        company: 'POCO'
    },
    {
        id: 5,
        name: 'Смартфон KOKO F3 Белый',
        image: 'assets/images/4.jpg',
        price: 34999,
        ram: 6,
        rom: 128,
        company: 'POCO'
    },
    {
        id: 6,
        name: 'Смартфон MOMO F3 Белый',
        image: 'assets/images/4.jpg',
        price: 34999,
        ram: 6,
        rom: 128,
        company: 'POCO'
    },
    {
        id: 7,
        name: 'Samsung Racks racks M52',
        image: 'assets/images/2.jpg',
        price: 40999,
        ram: 16,
        rom: 256,
        company: 'Samsung'
    },
    {
        id: 8,
        name: 'iphone 12',
        image: 'assets/images/2.jpg',
        price: 40999,
        ram: 16,
        rom: 256,
        company: 'Iphone'
    },
];

/*dom elements*/
const MOBILES_COUNT_FOR_ONE_PAGE = 4;

const mobilesContainer = document.querySelector('#mobiles');
const companiesInFilter = document.querySelector('#companies-filter');
const searchInp = document.querySelector('#searchInp');
const setFiltersBtn = document.querySelector('#setFiltersBtn');
const clearFiltersBtn = document.querySelector('#clearFiltersBtn');
const paginationContainer = document.querySelector('#pagination');

const allCompanies = new Set(mobiles.map(item => item.company));

let filters = getFilters();

setFiltersBtn.addEventListener('click', setFilters);
clearFiltersBtn.addEventListener('click', clearFilters);
window.addEventListener('beforeunload', saveChanges);

renderCompanies();
initFirstFilters();

function getFilters() {
    if (localStorage.getItem('filters')) {
        return JSON.parse(localStorage.getItem('filters'));
    } else {
        return {
            search: '',
            ramFrom: getMin('ram'),
            ramTo: getMax('ram'),
            romFrom: getMin('rom'),
            romTo: getMax('rom'),
            priceFrom: getMin('price'),
            priceTo: getMax('price'),
            companies: [...allCompanies],
            sort: '',
            page: 1,
        }
    }
}

function saveChanges(e) {
    localStorage.setItem('filters', JSON.stringify(filters));
}

function initFirstFilters() {
    if (localStorage.getItem('filters')) {
        unsetFilters();
        setFilters();
        return null;
    }

    clearFilters();
}

function initPaginationLinks(mobiles) {
    paginationContainer.innerHTML = '';
    const paginationCount = Math.ceil(mobiles.length / MOBILES_COUNT_FOR_ONE_PAGE);

    for (let i = 0; i < paginationCount; i++) {
        paginationContainer.insertAdjacentHTML('beforeend', `
                    <button class="btn" onclick="setPage(${i + 1})">${i + 1}</button>
        `);
    }
}
function setPage(page = 1) {
    filters.page = page;
    useFilters(mobiles);
}
function clearFilters(e) {
    filters = {
        search: '',
        ramFrom: getMin('ram'),
        ramTo: getMax('ram'),
        romFrom: getMin('rom'),
        romTo: getMax('rom'),
        priceFrom: getMin('price'),
        priceTo: getMax('price'),
        companies: [...allCompanies],
        sort: '',
        page: 1,
    }

    unsetFilters();
    setFilters();

    e.preventDefault();
}

function getMin(field) {
    return Math.min(...mobiles.map(item => item[field]));
}

function getMax(field) {
    return Math.max(...mobiles.map(item => item[field]));
}

function setFilters(e) {
    const filterInputs = [...document.querySelectorAll('#filters input')];
    filters.companies = [];
    filterInputs.forEach(item => {
        if (item.type === 'checkbox') {
            if (item.checked) {
                filters.companies.push(item.value);
            }

            return null;
        }

        filters[item.id] = item.value;
    });

    if (document.querySelector('#up').checked) {
        filters['sort'] = 'up';
    } else if (document.querySelector('#down').checked) {
        filters['sort'] = 'down';
    } else {
        filters['sort'] = '';
    }

    useFilters(mobiles);

    if (e) {
        e.preventDefault();
    }
}

function unsetFilters() {
    const form = document.querySelector('#filters');

    for (let field in filters) {
        if (field !== 'companies' && field !== 'page' && field !== 'sort') {
            form.querySelector(`#${field}`).value = filters[field];
        } else if (field === 'companies') {
            const checkboxes = document.querySelectorAll('input[type=checkbox]');
            checkboxes.forEach(item => {
                item.checked = filters.companies.includes(item.value);
            });
        } else if (field === 'sort') {
            if (filters.sort === 'up') {
                form.querySelector('#up').checked = true;
                form.querySelector('#down').checked = false;
            } else if (filters.sort === 'down') {
                form.querySelector('#down').checked = true;
                form.querySelector('#up').checked = false;
            } else {
                form.querySelector('#down').checked = false;
                form.querySelector('#up').checked = false;
            }
        }
    }

    useFilters(mobiles);
}

function useFilters(mobiles) {
    mobiles = mobiles.filter(item => item.name.toLowerCase().includes(filters.search.toLowerCase()));
    mobiles = getItemsByFromTo(mobiles, 'price', filters.priceFrom, filters.priceTo);
    mobiles = getItemsByFromTo(mobiles, 'ram', filters.ramFrom, filters.ramTo);
    mobiles = getItemsByFromTo(mobiles, 'rom', filters.romFrom, filters.romTo);
    mobiles = mobiles.filter(item => filters.companies.includes(item.company));
    mobiles = sort(mobiles);
    paginate(mobiles);

}
function sort(mobiles) {
    if (filters['sort'] === 'up') {
        return [...mobiles.sort((a, b) => a.price - b.price)];
    } else if (filters['sort'] === 'down') {
        return [...mobiles.sort((a,b) => b.price - a.price)];
    }

    return mobiles;
}
function paginate(mobiles, ) {
    initPaginationLinks(mobiles);

    mobiles = [...mobiles.splice((filters.page - 1) * MOBILES_COUNT_FOR_ONE_PAGE, MOBILES_COUNT_FOR_ONE_PAGE)];

    // final render
    renderMobiles(mobiles);
}

function getItemsByFromTo(arr, field, from = getMin(field), to = getMax(field)) {
    return arr.filter(item => item[field] >= from && item[field] <= to);
}

function renderMobiles(mobiles) {
    mobilesContainer.innerHTML = '';

    mobiles.forEach(mobile => {
        mobilesContainer.insertAdjacentHTML('beforeend', `<div class="card vertical">
                    <div class="image">
                        <img src="${mobile.image}" alt="image">
                    </div>
                    <h3>${mobile.name}</h3>
                    <div class="price">
                        ${mobile.price}₽
                    </div>
                    <button class="btn">Купить</button>
                </div>`);
    });
}

function renderCompanies() {
    companiesInFilter.innerHTML = '';

    allCompanies.forEach(company => {
        companiesInFilter.insertAdjacentHTML('beforeend', `
                        <label>
                            <input type="checkbox" value="${company}">
                            <span>${company}</span>
                        </label>`);
    });

}
