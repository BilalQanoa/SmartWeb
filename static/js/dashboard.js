// Dashboard utilities

function filterAssets(query) {
    const q = query.toLowerCase().trim();  //  the search text
    const rows = document.querySelectorAll('.asset-row');  // all table rows
    const noRes = document.getElementById('no-results');    // the "no results" row
    if (!noRes) return;
    let found = 0;  // counter for how many rows are visible

    rows.forEach(row => {
        const match = !q || row.dataset.title.includes(q);
        row.style.display = match ? '' : 'none';
        if (match) found++;
    });

    noRes.style.display = (q && found === 0) ? '' : 'none';
}
