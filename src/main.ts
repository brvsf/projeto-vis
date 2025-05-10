import { loadChart, clearChart } from './charts';
import { Taxi } from './taxi';

const taxi = new Taxi();

async function main() {

    // Initialize the taxi database
    await taxi.init();
    await taxi.loadTaxi();

    // Initializing load and clear buttons
    const loadBtn  = document.querySelector('#loadBtn');
    const clearBtn = document.querySelector('#clearBtn');

    // Initializing start and end date inputs
    const startDate = document.querySelector('#startDate');
    const endDate = document.querySelector('#endDate');

    // Add event listener to load and clear buttons
    if (!loadBtn || !clearBtn) {
        return;
    }

    loadBtn.addEventListener('click', async () => {
      clearChart();

      // Get the start and end dates from the input fields if they exist
      // If they don't exist, use default values
      const currentStartDate = (startDate as HTMLInputElement).value || '2023-01-01'; //
      const currentEndDate = (endDate as HTMLInputElement).value || '2023-01-31';

      const data = await taxi.trip_distance_per_tip_amount(
          10000,
          currentStartDate,
          currentEndDate
      );

      await loadChart(data);
      console.log('Data', data);
  });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });

    // Logs
    console.log('Load button:', loadBtn);
    console.log('Clear button:', clearBtn);
    console.log('Start date input:', startDate);
    console.log('End date input:', endDate);
}

window.onload = () => {
    main();
};
