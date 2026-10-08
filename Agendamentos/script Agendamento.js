const form = document.getElementById("formAgendamento");
const dataInput = document.getElementById("data");
const horarioSelect = document.getElementById("horario");
const listaConsultas = document.getElementById("listaConsultas");
const mensagem = document.getElementById("mensagem");

// Horários disponíveis
const horarios = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30"
];

// Define a data mínima como hoje
const hoje = new Date().toISOString().split("T")[0];
dataInput.min = hoje;


// Carrega os horários quando uma data é escolhida
dataInput.addEventListener("change", function () {

    horarioSelect.innerHTML =
        '<option value="">Selecione um horário</option>';

    horarios.forEach(function (horario) {

        const option = document.createElement("option");

        option.value = horario;
        option.textContent = horario;

        horarioSelect.appendChild(option);
    });

});


// Recupera os agendamentos
function obterAgendamentos() {

    return JSON.parse(
        localStorage.getItem("agendamentosPetCare")
    ) || [];

}


// Salva os agendamentos
function salvarAgendamentos(agendamentos) {

    localStorage.setItem(
        "agendamentosPetCare",
        JSON.stringify(agendamentos)
    );

}


// Exibe os agendamentos
function mostrarAgendamentos() {

    const agendamentos = obterAgendamentos();

    listaConsultas.innerHTML = "";

    if (agendamentos.length === 0) {

        listaConsultas.innerHTML = `
            <div class="sem-consultas">
                🐾 Nenhum agendamento realizado ainda.
            </div>
        `;

        return;
    }


    // Ordena por data e horário
    agendamentos.sort(function (a, b) {

        return (
            (a.data + a.horario)
                .localeCompare(b.data + b.horario)
        );

    });


    agendamentos.forEach(function (consulta) {

        const div = document.createElement("div");

        div.className = "consulta";

        div.innerHTML = `
            <div class="consulta-info">

                <h3>
                    ${consulta.pet}
                    ${consulta.animal === "Cachorro" ? "🐶" : ""}
                    ${consulta.animal === "Gato" ? "🐱" : ""}
                    ${consulta.animal === "Coelho" ? "🐰" : ""}
                    ${consulta.animal === "Outro" ? "🐾" : ""}
                </h3>

                <p>
                    <strong>👤 Tutor:</strong>
                    ${consulta.tutor}
                </p>

                <p>
                    <strong>🩺 Serviço:</strong>
                    ${consulta.servico}
                </p>

                <p>
                    <strong>📅 Data:</strong>
                    ${formatarData(consulta.data)}
                </p>

                <p>
                    <strong>⏰ Horário:</strong>
                    ${consulta.horario}
                </p>

                <p>
                    <strong>📞 Telefone:</strong>
                    ${consulta.telefone}
                </p>

                ${
                    consulta.observacao
                        ? `
                            <p>
                                <strong>📝 Observação:</strong>
                                ${consulta.observacao}
                            </p>
                        `
                        : ""
                }

            </div>

            <button
                class="cancelar"
                onclick="cancelarAgendamento(${consulta.id})"
            >
                Cancelar
            </button>
        `;

        listaConsultas.appendChild(div);

    });

}


// Formata a data para o padrão brasileiro
function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// Verifica se o horário já está ocupado
function horarioOcupado(data, horario) {

    const agendamentos = obterAgendamentos();

    return agendamentos.some(function (consulta) {

        return (
            consulta.data === data &&
            consulta.horario === horario
        );

    });

}


// Envio do formulário
form.addEventListener("submit", function (event) {

    event.preventDefault();

    const tutor =
        document.getElementById("tutor").value.trim();

    const telefone =
        document.getElementById("telefone").value.trim();

    const pet =
        document.getElementById("pet").value.trim();

    const animal =
        document.getElementById("animal").value;

    const servico =
        document.getElementById("servico").value;

    const data =
        document.getElementById("data").value;

    const horario =
        document.getElementById("horario").value;

    const observacao =
        document.getElementById("observacao").value.trim();


    // Verifica se todos os campos principais foram preenchidos
    if (
        !tutor ||
        !telefone ||
        !pet ||
        !animal ||
        !servico ||
        !data ||
        !horario
    ) {

        mensagem.innerHTML = `
            <div class="erro">
                ❌ Preencha todos os campos obrigatórios.
            </div>
        `;

        return;
    }


    // Verifica se o horário está ocupado
    if (horarioOcupado(data, horario)) {

        mensagem.innerHTML = `
            <div class="erro">
                ❌ Este horário já está ocupado.
                Escolha outro horário.
            </div>
        `;

        return;
    }


    // Cria o novo agendamento
    const novoAgendamento = {

        id: Date.now(),

        tutor: tutor,

        telefone: telefone,

        pet: pet,

        animal: animal,

        servico: servico,

        data: data,

        horario: horario,

        observacao: observacao

    };


    // Salva o agendamento
    const agendamentos = obterAgendamentos();

    agendamentos.push(novoAgendamento);

    salvarAgendamentos(agendamentos);


    // Mostra mensagem de sucesso
    mensagem.innerHTML = `
        <div class="sucesso">
            ✅ Agendamento realizado com sucesso!
        </div>
    `;


    // Limpa o formulário
    form.reset();

    horarioSelect.innerHTML =
        '<option value="">Escolha uma data primeiro</option>';


    // Atualiza a lista
    mostrarAgendamentos();


    // Vai para a lista de consultas
    setTimeout(function () {

        const consultas = document.getElementById("consultas");

        if (consultas) {

            consultas.scrollIntoView({
                behavior: "smooth"
            });

        }

    }, 500);

});


// Cancelar agendamento
function cancelarAgendamento(id) {

    const confirmar = confirm(
        "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) {
        return;
    }


    let agendamentos = obterAgendamentos();

    agendamentos = agendamentos.filter(function (consulta) {

        return consulta.id !== id;

    });


    salvarAgendamentos(agendamentos);

    mostrarAgendamentos();


    mensagem.innerHTML = `
        <div class="sucesso">
            ✅ Agendamento cancelado.
        </div>
    `;

}


// Mostra os agendamentos ao abrir a página
mostrarAgendamentos();