import { loadMap, clearMap } from './map';
import { linePlot, donutPlot } from './charts';
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
                // Consulta principal por local
                const result = await taxi.queryInfoByLocation(clickedLocationId);

                // Contagem diária (para o gráfico de linha)
                const countByDay = await taxi.queryInfoByDate(clickedLocationId);
                console.log('Contagem diária:', countByDay);

                // Renderiza o gráfico de linha com callback para brush
                linePlot(countByDay, { left: 25, right: 25, top: 10, bottom: 20 }, async (startDate, endDate) => {
                    if (startDate && endDate) {
                        console.log('Intervalo selecionado:', startDate, 'até', endDate);

                        // Atualiza os dados por hora conforme o intervalo selecionado no brush
                        const selectedData = await taxi.queryInfoByHour('*', 'COUNT', startDate, endDate);
                        console.log('Dados selecionados por hora:', selectedData);

                        // Atualiza o donut plot passando as horas selecionadas (supondo que donutPlot aceite callback)
                        donutPlot(selectedData, (selectedHours) => {
                            console.log('Horas selecionadas no donut:', [...selectedHours]);
                        });
                    } else {
                        console.log('Seleção foi limpa');

                        const allHoursData = await taxi.queryInfoByHour();
                        donutPlot(allHoursData, (selectedHours) => {
                            console.log('Horas selecionadas no donut:', [...selectedHours]);
                        });
                    }
                });

                // Inicializa o donut plot com dados gerais por hora (sem filtro)
                const allHoursData = await taxi.queryInfoByHour();
                donutPlot(allHoursData, (selectedHours) => {
                    console.log('Horas selecionadas no donut:', [...selectedHours]);
                });

                console.log('Dados retornados da consulta por local:', result);
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
