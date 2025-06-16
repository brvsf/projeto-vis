import { loadMap, clearMap } from './map';
import { Taxi } from './taxi';

const taxi = new Taxi();

async function main(data) {
    const loadBtn = document.querySelector('#question1');
    const clearBtn = document.querySelector('#question2');

    if (!loadBtn || !clearBtn) return;

    loadBtn.addEventListener('click', async () => {
        clearMap();
        await loadMap(data, taxi, async (clickedLocationId) => {
            console.log('Usuário clicou na região com ID:', clickedLocationId);
            try {
                const result = await taxi.queryInfoByLocation(clickedLocationId);
                console.log('Dados retornados da consulta:', result);
            } catch (err) {
                console.error('Erro ao consultar dados para o local:', err);
            }
        });
    });

    clearBtn.addEventListener('click', () => {
        clearMap();
    });
}

window.onload = async () => {
    const response = await fetch('00 - data/taxi-zones.json');
    const neighs = await response.json();

    console.log('Initializing Taxi...');
    await taxi.init();
    await taxi.loadTaxi();
    console.log('Taxi initialized');

    main(neighs);
};
