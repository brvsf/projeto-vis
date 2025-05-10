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

    let start_date = '2023-01-01';
    let end_date = '2023-01-31';

    startDate?.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        start_date = target.value;
    }
    );

    endDate?.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        end_date = target.value;
    }
    );

    if (!loadBtn || !clearBtn) {
        return;
    }

    loadBtn.addEventListener('click', async () => {
      clearChart();

      const currentStartDate = (startDate as HTMLInputElement).value || '2023-01-01';
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
