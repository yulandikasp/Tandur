
document.addEventListener('DOMContentLoaded', function() {
    const komoditasFilter = document.getElementById('komoditasFilter');
    const bulanFilter = document.getElementById('bulanFilter');
    const summaryDiv = document.getElementById('summary');

    function filterData() {
        let filtered = sampleData;
        const komoditasVal = komoditasFilter.value;
        const bulanVal = bulanFilter.value;

        if (komoditasVal !== 'all') {
            if (komoditasVal === 'padi_palawija') {
                filtered = filtered.filter(d => d.komoditas === 'padi' || d.komoditas === 'palawija');
            } else {
                filtered = filtered.filter(d => d.komoditas === komoditasVal);
            }
        }

        if (bulanVal !== 'all') {
            filtered = filtered.filter(d => d.bulan === bulanVal);
        }

        return filtered;
    }

    function updateSummary(data) {
        const total = data.length;
        const counts = {};
        let perkiraanCounts = {};

        data.forEach(d => {
            counts[d.pengecekan] = (counts[d.pengecekan] || 0) + 1;
            perkiraanCounts[d.perkiraan] = (perkiraanCounts[d.perkiraan] || 0) + 1;
        });

        let mostPerkiraan = Object.keys(perkiraanCounts).reduce((a,b) => perkiraanCounts[a] > perkiraanCounts[b] ? a : b, '');
        let mostPerkiraanPercent = ((perkiraanCounts[mostPerkiraan] || 0) / total * 100).toFixed(1);

        summaryDiv.innerHTML = \`
            <b>Total baris:</b> \${total} |
            Bisa ubinan: \${((counts['Bisa dilakukan ubinan'] || 0)/total*100).toFixed(1)}% |
            Gagal panen: \${((counts['Gagal panen/puso'] || 0)/total*100).toFixed(1)}% |
            Lewat panen: \${((counts['Lewat panen'] || 0)/total*100).toFixed(1)}% |
            Perkiraan panen terbanyak: \${mostPerkiraan} (\${mostPerkiraanPercent}%)
        \`;
    }

    function updateCharts(data) {
        // Pie Chart
        const pieCounts = {};
        Object.keys(warnaKategori).forEach(k => pieCounts[k] = 0);
        data.forEach(d => pieCounts[d.pengecekan] = (pieCounts[d.pengecekan] || 0) + 1);

        new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(pieCounts),
                datasets: [{
                    data: Object.values(pieCounts),
                    backgroundColor: Object.keys(pieCounts).map(k => warnaKategori[k])
                }]
            }
        });

        // Line Chart
        const bulanOrder = ['Mei', 'Juni', 'Juli', 'Agustus'];
        const lineData = bulanOrder.map(b => data.filter(d => d.bulan === b).length);

        new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: bulanOrder,
                datasets: [{
                    label: 'Jumlah',
                    data: lineData,
                    borderColor: '#007bff',
                    fill: false
                }]
            }
        });

        // Bar Chart PPL
        const pplCounts = {};
        data.forEach(d => {
            if (!pplCounts[d.PPL]) pplCounts[d.PPL] = { 'Bisa dilakukan ubinan':0, 'Lewat panen':0, 'Gagal panen/puso':0 };
            pplCounts[d.PPL][d.pengecekan] = (pplCounts[d.PPL][d.pengecekan] || 0) + 1;
        });

        new Chart(document.getElementById('barChartPPL'), {
            type: 'bar',
            data: {
                labels: Object.keys(pplCounts),
                datasets: Object.keys(warnaKategori).filter(k => k in Object.values(pplCounts)[0]).map(k => ({
                    label: k,
                    data: Object.keys(pplCounts).map(p => pplCounts[p][k] || 0),
                    backgroundColor: warnaKategori[k]
                }))
            },
            options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }
        });

        // Bar Chart PML
        const pmlCounts = {};
        data.forEach(d => {
            if (!pmlCounts[d.PML]) pmlCounts[d.PML] = { 'Bisa dilakukan ubinan':0, 'Lewat panen':0, 'Gagal panen/puso':0 };
            pmlCounts[d.PML][d.pengecekan] = (pmlCounts[d.PML][d.pengecekan] || 0) + 1;
        });

        new Chart(document.getElementById('barChartPML'), {
            type: 'bar',
            data: {
                labels: Object.keys(pmlCounts),
                datasets: Object.keys(warnaKategori).filter(k => k in Object.values(pmlCounts)[0]).map(k => ({
                    label: k,
                    data: Object.keys(pmlCounts).map(p => pmlCounts[p][k] || 0),
                    backgroundColor: warnaKategori[k]
                }))
            },
            options: { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }
        });
    }

    function updateTable(data) {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        const pagination = document.getElementById('pagination');

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        pagination.innerHTML = '';

        if (!data.length) return;

        Object.keys(data[0]).forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            tableHead.appendChild(th);
        });

        let currentPage = 1;
        const rowsPerPage = 5;
        const totalPages = Math.ceil(data.length / rowsPerPage);

        function renderPage(page) {
            tableBody.innerHTML = '';
            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            data.slice(start, end).forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(val => {
                    const td = document.createElement('td');
                    td.textContent = val;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        }

        for (let i=1; i<=totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.disabled = i === currentPage;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderPage(currentPage);
                document.querySelectorAll('#pagination button').forEach(b => b.disabled = false);
                btn.disabled = true;
            });
            pagination.appendChild(btn);
        }

        renderPage(currentPage);
    }

    function refreshDashboard() {
        const filtered = filterData();
        updateSummary(filtered);
        updateCharts(filtered);
        updateTable(filtered);
    }

    komoditasFilter.addEventListener('change', refreshDashboard);
    bulanFilter.addEventListener('change', refreshDashboard);

    refreshDashboard();
});
