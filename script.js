const form = document.getElementById('weight-form');
const errorMessage = document.getElementById('error-message');
const tableBody = document.querySelector('#weight-table tbody');
const ctx = document.getElementById('weight-chart').getContext('2d');
let chart;
let weights = [];

// Load weights from localStorage
if (localStorage.getItem('weights')) {
    weights = JSON.parse(localStorage.getItem('weights'));
    updateTable();
    updateChart();
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (isNaN(weight) || weight <= 0) {
        errorMessage.textContent = 'Please enter a valid weight.';
        errorMessage.focus();
        return;
    }
    
    const newEntry = {date, weight};
    weights.push(newEntry);
    weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    updateTable();
    updateChart();
    checkWeightChange(newEntry);
    saveWeights();
    form.reset();
    errorMessage.textContent = '';
});

function updateTable() {
    tableBody.innerHTML = '';
    weights.forEach((entry, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.weight;
        const actionsCell = row.insertCell(2);
        actionsCell.innerHTML = `
            <button onclick="editWeight(${index})">Edit</button>
            <button onclick="confirmDelete(${index})">Delete</button>
        `;
    });
}

function updateChart() {
    const labels = weights.map(entry => entry.date);
    const data = weights.map(entry => entry.weight);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (g)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function editWeight(index) {
    const entry = weights[index];
    document.getElementById('date').value = entry.date;
    document.getElementById('weight').value = entry.weight;
    weights.splice(index, 1);
    updateTable();
    updateChart();
    saveWeights();
}

function confirmDelete(index) {
    if (confirm('Are you sure you want to delete this weight entry?')) {
        deleteWeight(index);
    }
}

function deleteWeight(index) {
    weights.splice(index, 1);
    updateTable();
    updateChart();
    saveWeights();
}

function saveWeights() {
    localStorage.setItem('weights', JSON.stringify(weights));
}

function checkWeightChange(newEntry) {
    if (weights.length < 2) return;
    
    const previousWeight = weights[weights.length - 2].weight;
    const weightChange = newEntry.weight - previousWeight;
    const changePercentage = (weightChange / previousWeight) * 100;
    
    if (Math.abs(changePercentage) > 5) {
        alert(`Significant weight change detected! 
        Previous weight: ${previousWeight}g
        New weight: ${newEntry.weight}g
        Change: ${changePercentage.toFixed(2)}%`);
    }
}
