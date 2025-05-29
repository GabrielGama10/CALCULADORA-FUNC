// Variáveis globais para os gráficos
let chartLinear = null;
let chartExponencial = null;
let chartQuad = null;

// Função para formatar números (substitui ponto por vírgula e remove decimais para inteiros)
function formatarNumero(num) {
    if (num === null || num === undefined) return 'Não existe';
    const numFormatado = num % 1 === 0 ? num.toString() : num.toFixed(4).replace(/\.?0+$/, '');
    return numFormatado.replace('.', ',');
}

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    // Alternar entre seções
    document.getElementById('tipoCalculo').addEventListener('change', function() {
        const tipo = this.value;
        document.querySelectorAll('.secao').forEach(secao => {
            secao.classList.remove('ativa');
        });
        document.getElementById(`secao${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`).classList.add('ativa');
    });

    // Configuração do select de infinito
    document.getElementById('opcoesInfinito').addEventListener('change', function() {
        document.getElementById('valorLimite').value = this.value;
    });

    // Event listeners para os botões
    document.getElementById('btnLinear').addEventListener('click', calcularFuncaoLinear);
    document.getElementById('btnExponencial').addEventListener('click', calcularFuncaoExponencial);
    document.getElementById('btnQuadratica').addEventListener('click', calcularFuncaoQuadratica);
    document.getElementById('btnLimite').addEventListener('click', calcularLimite);
    document.getElementById('btnDerivada').addEventListener('click', calcularDerivada);
    document.getElementById('btnIntegral').addEventListener('click', calcularIntegral);
});

// =============== FUNÇÕES LINEARES ===============
function calcularFuncaoLinear() {
    const a = parseFloat(document.getElementById('a1').value);
    const b = parseFloat(document.getElementById('b1').value);
    const resultado = document.getElementById('resultadoLinear');

    if (isNaN(a) || isNaN(b)) {
        resultado.innerHTML = '<span style="color:red">Insira valores válidos para a e b.</span>';
        return;
    }

    const funcaoStr = formatarFuncaoLinear(a, b);
    document.getElementById('funcaoLinearExibida').innerHTML = `<strong>Função:</strong> ${funcaoStr}`;

    const raiz = a !== 0 ? (-b / a) : null;
    resultado.innerHTML = `
        <p><strong>Raiz:</strong> ${formatarNumero(raiz)}</p>
        <p><strong>Coeficiente angular:</strong> ${formatarNumero(a)} (${a > 0 ? 'crescente' : a < 0 ? 'decrescente' : 'constante'})</p>
        <p><strong>Y:</strong> ${formatarNumero(b)}</p>
    `;

    desenharGraficoLinear(a, b, raiz);
}

function formatarFuncaoLinear(a, b) {
    let str = 'f(x) = ';
    if (a === 1) str += 'x';
    else if (a === -1) str += '-x';
    else if (a !== 0) str += `${formatarNumero(a)}x`;
    
    if (b !== 0) {
        if (a !== 0) str += b > 0 ? ' + ' : ' - ';
        str += formatarNumero(Math.abs(b));
    }
    return str || '0';
}

function desenharGraficoLinear(a, b, raiz) {
    const ctx = document.getElementById('graficoLinear').getContext('2d');
    if (chartLinear) chartLinear.destroy();

    const datasets = [
        {
            label: 'f(x)',
            data: Array.from({length: 21}, (_, i) => ({x: i-10, y: a*(i-10)+b})),
            borderColor: '#3366ff',
            borderWidth: 2,
            fill: false,
            pointRadius: 0
        },
        {
            label: 'Y',
            data: [{x: 0, y: b}],
            backgroundColor: '#ff3333',
            borderColor: '#000',
            pointRadius: 6,
            type: 'scatter'
        }
    ];

    if (raiz !== null) {
        datasets.push({
            label: 'Raiz',
            data: [{x: raiz, y: 0}],
            backgroundColor: '#33cc33',
            borderColor: '#000',
            pointRadius: 6,
            type: 'scatter'
        });
    }

    chartLinear = criarGrafico(ctx, datasets);
}

// =============== FUNÇÕES EXPONENCIAIS ===============
function calcularFuncaoExponencial() {
    const expressao = document.getElementById('expressaoExponencial').value.trim();
    const xValor = document.getElementById('valorXExponencial').value;
    const resultado = document.getElementById('resultadoExponencial');

    if (!expressao) {
        resultado.innerHTML = '<span style="color:red">Digite uma função válida.</span>';
        return;
    }

    try {
        const compiled = math.compile(expressao);
        document.getElementById('funcaoExponencialExibida').innerHTML = `<strong>Função:</strong> f(x) = ${expressao.replace(/\^/g, '<sup>').replace(/(\d+)/g, '$1</sup>')}`;
        
        let resultadoHTML = '';
        if (xValor && !isNaN(parseFloat(xValor))) {
            const valorFuncao = compiled.evaluate({x: parseFloat(xValor)});
            resultadoHTML = `<p><strong>Valor em x = ${xValor.replace('.', ',')}:</strong> ${formatarNumero(valorFuncao)}</p>`;
        }
        
        resultado.innerHTML = resultadoHTML;
        desenharGraficoExponencial(expressao);
    } catch (e) {
        resultado.innerHTML = `<span style="color:red">Erro: ${e.message}</span>`;
    }
}

function desenharGraficoExponencial(expressao) {
    const ctx = document.getElementById('graficoExponencial').getContext('2d');
    if (chartExponencial) chartExponencial.destroy();

    try {
        const compiled = math.compile(expressao);
        const pontos = Array.from({length: 21}, (_, i) => {
            const x = (i - 10) * 0.5;
            return {x, y: compiled.evaluate({x})};
        });

        const interceptoY = compiled.evaluate({x: 0});

        const datasets = [
            {
                label: 'f(x)',
                data: pontos,
                borderColor: '#3366ff',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            },
            {
                label: 'Y',
                data: [{x: 0, y: interceptoY}],
                backgroundColor: '#ff3333',
                borderColor: '#000',
                pointRadius: 6,
                type: 'scatter'
            }
        ];

        chartExponencial = criarGrafico(ctx, datasets);
    } catch (e) {
        console.error("Erro ao desenhar gráfico:", e);
    }
}

// =============== FUNÇÕES QUADRÁTICAS ===============
function calcularFuncaoQuadratica() {
    const a = parseFloat(document.getElementById('aQuad').value);
    const b = parseFloat(document.getElementById('bQuad').value);
    const c = parseFloat(document.getElementById('cQuad').value);
    const resultado = document.getElementById('resultadoQuad');

    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) {
        resultado.innerHTML = '<span style="color:red">Insira valores válidos (a ≠ 0).</span>';
        return;
    }

    document.getElementById('funcaoQuadExibida').innerHTML = 
        `<strong>Função:</strong> ${formatarFuncaoQuadratica(a, b, c)}`;

    const delta = b * b - 4 * a * c;
    const xVertice = -b / (2 * a);
    const yVertice = -delta / (4 * a);

    let raizes = [];
    if (delta > 0) {
        raizes = [(-b + Math.sqrt(delta))/(2*a), (-b - Math.sqrt(delta))/(2*a)];
    } else if (delta === 0) {
        raizes = [-b/(2*a)];
    }

    resultado.innerHTML = `
        <p><strong>Raízes:</strong> ${raizes.length ? raizes.map(r => formatarNumero(r)).join(', ') : 'Sem raízes reais'}</p>
        <p><strong>Vértice:</strong> (${formatarNumero(xVertice)}, ${formatarNumero(yVertice)})</p>
        <p><strong>Concavidade:</strong> ${a > 0 ? 'Para cima' : 'Para baixo'}</p>
    `;

    desenharGraficoQuadratica(a, b, c, xVertice, yVertice, raizes);
}

function formatarFuncaoQuadratica(a, b, c) {
    let str = 'f(x) = ';
    if (a === 1) str += 'x²';
    else if (a === -1) str += '-x²';
    else str += `${formatarNumero(a)}x²`;
    
    if (b !== 0) {
        str += b > 0 ? ' + ' : ' - ';
        if (Math.abs(b) !== 1) str += formatarNumero(Math.abs(b));
        str += 'x';
    }
    
    if (c !== 0) {
        str += c > 0 ? ' + ' : ' - ';
        str += formatarNumero(Math.abs(c));
    }
    
    return str;
}

function desenharGraficoQuadratica(a, b, c, xv, yv, raizes) {
    const ctx = document.getElementById('graficoQuad').getContext('2d');
    if (chartQuad) chartQuad.destroy();

    const datasets = [
        {
            label: 'f(x)',
            data: Array.from({length: 21}, (_, i) => {
                const x = xv - 5 + i * 0.5;
                return {x, y: a*x*x + b*x + c};
            }),
            borderColor: '#3366ff',
            borderWidth: 2,
            fill: false,
            pointRadius: 0
        },
        {
            label: 'Vértice',
            data: [{x: xv, y: yv}],
            backgroundColor: '#ff3333',
            borderColor: '#000',
            pointRadius: 6,
            type: 'scatter'
        }
    ];

    raizes.forEach((raiz, i) => {
        datasets.push({
            label: `Raiz ${i+1}`,
            data: [{x: raiz, y: 0}],
            backgroundColor: '#33cc33',
            borderColor: '#000',
            pointRadius: 6,
            type: 'scatter'
        });
    });

    chartQuad = criarGrafico(ctx, datasets);
}

// =============== CÁLCULO DE LIMITES ===============
function calcularLimite() {
    const expressao = document.getElementById('expressaoLimite').value.trim();
    const x0Input = document.getElementById('valorLimite').value.trim();
    const resultado = document.getElementById('resultadoLimite');

    if (!expressao || !x0Input) {
        resultado.innerHTML = '<span style="color:red">Preencha todos os campos.</span>';
        return;
    }

    try {
        const x0 = x0Input === "Infinity" ? Infinity : 
                  x0Input === "-Infinity" ? -Infinity : parseFloat(x0Input);
        
        const valor = math.evaluate(expressao, {x: x0});
        resultado.innerHTML = `<strong>Limite quando x → ${x0Input}:</strong> ${formatarNumero(valor)}`;
    } catch (e) {
        resultado.innerHTML = `<span style="color:red">Erro: ${e.message}</span>`;
    }
}

// =============== CÁLCULO DE DERIVADA ===============
function calcularDerivada() {
    const expressao = document.getElementById('expressaoDerivada').value.trim();
    const variavel = document.getElementById('variavelDerivada').value.trim() || 'x';
    const resultado = document.getElementById('resultadoDerivada');

    if (!expressao) {
        resultado.innerHTML = '<span style="color:red">Digite uma função válida.</span>';
        return;
    }

    try {
        // A biblioteca math.js pode calcular derivadas simbolicamente
        const derivada = math.derivative(expressao, variavel);
        resultado.innerHTML = `<strong>Derivada de f(x) = ${expressao} em relação a ${variavel}:</strong> ${derivada.toString().replace(/ /g, '')}`; // Remover espaços para melhor exibição
    } catch (e) {
        resultado.innerHTML = `<span style="color:red">Erro: ${e.message}</span>`;
    }
}

// =============== CÁLCULO DE INTEGRAL ===============
function calcularIntegral() {
    const expressao = document.getElementById('expressaoIntegral').value.trim();
    const variavel = document.getElementById('variavelIntegral').value.trim() || 'x';
    const resultado = document.getElementById('resultadoIntegral');

    if (!expressao) {
        resultado.innerHTML = '<span style="color:red">Digite uma função válida.</span>';
        return;
    }

    try {
        // math.js não tem um método nativo para integração simbólica geral.
        // Uma alternativa seria usar um serviço externo ou uma biblioteca mais robusta se necessário.
        // Por enquanto, vamos exibir uma mensagem indicando que a integração simbólica não é suportada diretamente.
        resultado.innerHTML = '<span style="color:orange">Cálculo de integral simbólica não suportado diretamente por esta biblioteca.</span>';
        // Se for integral definida, poderia ser avaliada numericamente, mas a requisição é para "calcular", que sugere simbólica.
    } catch (e) {
        resultado.innerHTML = `<span style="color:red">Erro: ${e.message}</span>`;
    }
}

// =============== FUNÇÃO AUXILIAR PARA GRÁFICOS ===============
function criarGrafico(ctx, datasets) {
    return new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            elements: {
                line: { tension: 0 }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'x' },
                    grid: {
                        color: ctx => ctx.tick.value === 0 ? '#000' : '#ddd',
                        lineWidth: ctx => ctx.tick.value === 0 ? 2 : 1
                    }
                },
                y: {
                    title: { display: true, text: 'f(x)' },
                    grid: {
                        color: ctx => ctx.tick.value === 0 ? '#000' : '#ddd',
                        lineWidth: ctx => ctx.tick.value === 0 ? 2 : 1
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12 }
                }
            }
        }
    });
}