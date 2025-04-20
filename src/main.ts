import { Taxi } from "./taxi";

function createTableWithInnerHTML(data: any[]) {
    let tableHTML = '<table border="1"><tr>';

    Object.keys(data[0]).forEach(key => {
        tableHTML += `<th>${key}</th>`;
    });

    tableHTML += '</tr>';

    data.forEach( (item: any) => {
        tableHTML += '<tr>';
        Object.values(item).forEach(value => {
            tableHTML += `<td>${value}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</table>';

    const div = document.querySelector("#table");
    if(div) {
        div.innerHTML += tableHTML;
    }
}

function getTransformation(): Promise<string> {
  // Função para obter o valor do input e retornar uma Promise
  return new Promise((resolve) => {
    const input = document.getElementById("entradaTexto") as HTMLInputElement;
    const output = document.getElementById("resultado") as HTMLDivElement;

    // Obtenha o valor diretamente após o clique
    const value = input.value;
    output.innerHTML = `Você digitou: ${value}`;
    resolve(value); // resolve a Promise com o valor
  });
}

window.onload = async () => {
  const months = 6;
  const limit = 50;

  const taxi = new Taxi();
  await taxi.init();
  await taxi.loadTaxi(months);

  const data = await taxi.test(limit);
  const runs_per_day = await taxi.runs_per_day(limit);
  const mean_value_per_day = await taxi.mean_value_per_day(limit);
  const table_div = document.getElementById("table");

  if (!table_div) {
    console.error("A div com id 'table' não foi encontrada.");
    return;
  }

  // Exibe a tabela original imediatamente
  createTableWithInnerHTML(data);

  // Função para atualizar a tabela conforme o comando
  const updateTable = (input: string) => {
    const cleanedInput = input.trim().toLowerCase();

    table_div.innerHTML = ""; // Limpa a tabela atual

    if (cleanedInput === "runs") {
      createTableWithInnerHTML(runs_per_day); // Exibe a tabela "runs_per_day"
    } else if (cleanedInput === "mean") {
      createTableWithInnerHTML(mean_value_per_day); // Exibe a tabela "mean_value_per_day"
    } else if (cleanedInput === "original") {
      createTableWithInnerHTML(data); // Exibe a tabela original novamente
    } else {
      alert("Comando inválido. Tente novamente.");
      createTableWithInnerHTML(data); // Exibe a tabela original novamente
    }
  };

  // Aguardar a interação do botão
  const button = document.getElementById("botaoEnviar") as HTMLButtonElement;
  button.addEventListener("click", async () => {
    const input = await getTransformation();
    updateTable(input); // Atualiza a tabela com base no comando
  });
};
