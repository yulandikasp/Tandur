document.addEventListener("DOMContentLoaded", function() {
    const komoditasSelect = document.getElementById("filterKomoditas");
    const bulanSelect = document.getElementById("filterBulan");
    const summaryDiv = document.getElementById("summary");

    // Contoh data
    const data = [
        { komoditas: "Padi", bulan: "Mei", pengecekan: "Bisa dilakukan ubinan", PPL: "A", PML: "X" },
        { komoditas: "Palawija", bulan: "Juni", pengecekan: "Lewat panen", PPL: "B", PML: "Y" },
        { komoditas: "Padi", bulan: "Juli", pengecekan: "Gagal panen/puso", PPL: "C", PML: "Z" }
    ];

    const uniqueKomoditas = [...new Set(data.map(d => d.komoditas))];
    const uniqueBulan = [...new Set(data.map(d => d.bulan))];

    komoditasSelect.innerHTML = '<option value="">Semua</option>' + uniqueKomoditas.map(k => `<option value="${k}">${k}</option>`).join("");
    bulanSelect.innerHTML = '<option value="">Semua</option>' + uniqueBulan.map(b => `<option value="${b}">${b}</option>`).join("");

    function renderSummary(filtered) {
        summaryDiv.innerHTML = "Jumlah baris: " + filtered.length;
    }

    function applyFilter() {
        const fKomoditas = komoditasSelect.value;
        const fBulan = bulanSelect.value;
        const filtered = data.filter(d =>
            (fKomoditas === "" || d.komoditas === fKomoditas) &&
            (fBulan === "" || d.bulan === fBulan)
        );
        renderSummary(filtered);
        console.log("Filtered Data:", filtered);
    }

    komoditasSelect.addEventListener("change", applyFilter);
    bulanSelect.addEventListener("change", applyFilter);

    applyFilter();
});