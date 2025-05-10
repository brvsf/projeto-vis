import { scatterPlot, clearChart } from './charts';
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
      const currentStartDate = (startDate as HTMLInputElement).value || '2023-01-01 00:00:00'; //
      const currentEndDate = (endDate as HTMLInputElement).value || '2023-01-31 00:00:00';

      console.log('Start Date', currentStartDate);
      console.log('End Date', currentEndDate);

      // If the start date is greater than the end date, show an error message
      if (new Date(currentStartDate) > new Date(currentEndDate)) {
          alert('Start date cannot be greater than end date');
          return;
      }

      // Query the database for trip distance and tip amount
      let data = await taxi.trip_distance_per_tip_amount(
          null,
          currentStartDate,
          currentEndDate
      );
      data = data.filter(d => d.trip_distance >= 0 && d.tip_amount >= 0);

      // Plot the data using the scatter plot function
      await scatterPlot(data);

      // Logs
      console.log('Data', data);
      console.log('Start Date After', currentStartDate);
      console.log('End Date After', currentEndDate);
  });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });

    // Logs

}

window.onload = () => {
    main();
};
