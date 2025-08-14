// Global variables
let solves = [];
let blogPosts = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    autoImportSampleData();
    setupNavigation();
    setupEventListeners();
    updateDashboard();
    renderBlogPosts();
    updateStats();
    initializeCharts();
    
    // Update charts after initialization
    setTimeout(() => {
        updateCharts();
    }, 500);
});

// Data Management
function loadData() {
    solves = JSON.parse(localStorage.getItem('rubiksSolves') || '[]');
    blogPosts = JSON.parse(localStorage.getItem('rubiksBlogPosts') || '[]');
}

function saveData() {
    localStorage.setItem('rubiksSolves', JSON.stringify(solves));
    localStorage.setItem('rubiksBlogPosts', JSON.stringify(blogPosts));
}

function autoImportSampleData() {
    // Only import if no data exists
    if (solves.length === 0 && blogPosts.length === 0) {
        // Import solves data
        fetch('data/rubiks-solves.json')
            .then(response => response.json())
            .then(data => {
                solves = data.solves;
                console.log(`Auto-imported ${solves.length} solves`);
            })
            .catch(error => {
                console.log('No sample solves data found, starting with empty data');
            });

        // Import blog posts data
        fetch('data/rubiks-blog-posts.json')
            .then(response => response.json())
            .then(data => {
                blogPosts = data.blogPosts;
                console.log(`Auto-imported ${blogPosts.length} blog posts`);
            })
            .catch(error => {
                console.log('No sample blog posts found, starting with empty data');
            });

        // Save the imported data
        setTimeout(() => {
            saveData();
            updateDashboard();
            renderBlogPosts();
            updateStats();
            updateCharts();
            console.log('Auto-import completed. Solves:', solves.length, 'Posts:', blogPosts.length);
        }, 100);
    }
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Solve form
    const solveForm = document.getElementById('solve-form');
    solveForm.addEventListener('submit', handleSolveSubmit);

    // Scramble generation
    const generateScrambleBtn = document.getElementById('generate-scramble');
    generateScrambleBtn.addEventListener('click', () => {
        document.getElementById('solve-scramble').value = generateScramble();
    });

    // Data import/export
    const csvFile = document.getElementById('csv-file');
    const jsonFile = document.getElementById('json-file');
    csvFile.addEventListener('change', handleCSVImport);
    jsonFile.addEventListener('change', handleJSONImport);

    // Export buttons
    document.getElementById('export-solves').addEventListener('click', exportSolves);
    document.getElementById('export-solves-csv').addEventListener('click', exportSolvesCSV);
    document.getElementById('export-posts').addEventListener('click', exportPosts);
    document.getElementById('export-all').addEventListener('click', exportAllData);

    // Blog form
    const blogForm = document.getElementById('blog-form');
    blogForm.addEventListener('submit', handleBlogSubmit);

    // New post button
    const newPostBtn = document.getElementById('new-post-btn');
    newPostBtn.addEventListener('click', () => {
        document.getElementById('post-modal').style.display = 'block';
    });

    // Preview button
    const previewBtn = document.getElementById('preview-btn');
    previewBtn.addEventListener('click', handlePreview);

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('post-modal').style.display = 'none';
            document.getElementById('preview-modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Blog filters
    const categoryFilter = document.getElementById('category-filter');
    const tagFilter = document.getElementById('tag-filter');
    const showPrivate = document.getElementById('show-private');

    categoryFilter.addEventListener('change', renderBlogPosts);
    tagFilter.addEventListener('change', renderBlogPosts);
    showPrivate.addEventListener('change', renderBlogPosts);

    // Chart controls
    const chartType = document.getElementById('chart-type');
    const timeRange = document.getElementById('time-range');

    chartType.addEventListener('change', updateCharts);
    timeRange.addEventListener('change', updateCharts);
}

// Solve Management
function handleSolveSubmit(e) {
    e.preventDefault();
    
    const timeInput = document.getElementById('solve-time').value.trim();
    const date = document.getElementById('solve-date').value;
    const scramble = document.getElementById('solve-scramble').value;
    const notes = document.getElementById('solve-notes').value;

    // Handle DNF or numeric time
    let time, timeWithPenalty;
    if (/DNF/i.test(timeInput)) {
        time = 'DNF';
        timeWithPenalty = 'DNF';
    } else {
        const parsedTime = parseFloat(timeInput);
        if (isNaN(parsedTime) || parsedTime < 0) {
            alert('Please enter a valid time (number) or DNF');
            return;
        }
        time = parsedTime;
        timeWithPenalty = parsedTime;
    }

    const solve = {
        id: Date.now(),
        time: time,
        timeWithPenalty: timeWithPenalty,
        date: date,
        scramble: scramble,
        notes: notes,
        timestamp: new Date(date).getTime()
    };

    solves.push(solve);
    solves.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    
    saveData();
    updateDashboard();
    updateCharts();
    updateStats();
    
    // Reset form
    e.target.reset();
    document.getElementById('solve-date').value = new Date().toISOString().slice(0, 16);
    document.getElementById('solve-scramble').value = generateScramble();
}

function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        const lines = csv.split('\n');
        
        // Check if it's the new format (semicolon-separated)
        const isNewFormat = lines[0].includes(';');
        const separator = isNewFormat ? ';' : ',';
        const headers = lines[0].split(separator).map(h => h.trim());
        
        console.log('CSV Headers:', headers);
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(separator).map(v => v.trim());
                
                let solve = {
                    id: Date.now() + i,
                    timestamp: Date.now() + i
                };
                
                if (isNewFormat && headers.length >= 6) {
                    // New format: No;Time;Comment;Scramble;Date;TimewithPenalty
                    solve = {
                        id: Date.now() + i,
                        number: parseInt(values[0]) || i,
                        time: parseFloat(values[1]),
                        notes: values[2] || '',
                        scramble: values[3] || '',
                        date: values[4] || new Date().toISOString(),
                        timeWithPenalty: parseFloat(values[5]) || parseFloat(values[1]),
                        timestamp: new Date(values[4] || new Date()).getTime()
                    };
                } else {
                    // Old format: time, date, notes
                    solve = {
                        id: Date.now() + i,
                        time: parseFloat(values[0]),
                        date: values[1],
                        notes: values[2] || '',
                        timestamp: new Date(values[1]).getTime()
                    };
                }
                
                solves.push(solve);
            }
        }
        
        solves.sort((a, b) => b.timestamp - a.timestamp);
        saveData();
        updateDashboard();
        updateCharts();
        updateStats();
        
        alert(`Imported ${lines.length - 1} solves successfully!`);
    };
    reader.readAsText(file);
}

function handleJSONImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (data.solves) {
                solves = data.solves;
                alert(`Imported ${solves.length} solves successfully!`);
            }
            
            if (data.blogPosts) {
                blogPosts = data.blogPosts;
                alert(`Imported ${blogPosts.length} blog posts successfully!`);
            }
            
            if (data.solves && data.blogPosts) {
                alert(`Imported ${solves.length} solves and ${blogPosts.length} blog posts successfully!`);
            }
            
            saveData();
            updateDashboard();
            updateCharts();
            updateStats();
            renderBlogPosts();
            updateTagFilter();
            
        } catch (error) {
            alert('Error importing JSON file. Please check the file format.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

function exportSolves() {
    const data = {
        solves: solves,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    downloadJSON(data, 'rubiks-solves.json');
}

function exportPosts() {
    const data = {
        blogPosts: blogPosts,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    downloadJSON(data, 'rubiks-blog-posts.json');
}

function exportAllData() {
    const data = {
        solves: solves,
        blogPosts: blogPosts,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    downloadJSON(data, 'rubiks-all-data.json');
}

function downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Data exported successfully as ${filename}`);
}

function showSolveDetails(solveId) {
    const solve = solves.find(s => s.id === solveId);
    if (!solve) return;

    document.getElementById('detail-time').textContent = formatTime(solve.time);
    document.getElementById('detail-date').textContent = formatDate(solve.date);
    document.getElementById('detail-scramble').textContent = solve.scramble || 'No scramble recorded';
    document.getElementById('detail-notes').textContent = solve.notes || 'No notes';
    
    if (solve.timeWithPenalty && solve.timeWithPenalty !== solve.time) {
        document.getElementById('detail-penalty').textContent = formatTime(solve.timeWithPenalty);
        document.getElementById('penalty-item').style.display = 'flex';
    } else {
        document.getElementById('penalty-item').style.display = 'none';
    }

    document.getElementById('solve-modal').style.display = 'block';
}

function exportSolvesCSV() {
    if (solves.length === 0) {
        alert('No solves to export!');
        return;
    }

    // Create CSV content with the new format
    const csvContent = [
        'No;Time;Comment;Scramble;Date;TimewithPenalty'
    ];

    solves.forEach((solve, index) => {
        const row = [
            solve.number || (index + 1),
            solve.time,
            solve.notes || '',
            solve.scramble || '',
            solve.date,
            solve.timeWithPenalty || solve.time
        ].join(';');
        csvContent.push(row);
    });

    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `rubiks-solves-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Exported ${solves.length} solves to CSV successfully!`);
}

// Dashboard Updates
function updateDashboard() {
    updateQuickStats();
    updateRecentSolves();
}

function updateQuickStats() {
    if (solves.length === 0) return;

    const times = solves.map(s => s.time);
    
    // Calculate WCA-compliant averages
    const averages = computeBestAverages(solves);
    
    document.getElementById('best-single').textContent = formatTime(Math.min(...times));
    document.getElementById('best-ao5').textContent = averages.bestAo5.time;
    document.getElementById('best-ao12').textContent = averages.bestAo12.time;
}

function updateRecentSolves() {
    const container = document.getElementById('recent-solves');
    
    if (solves.length === 0) {
        container.innerHTML = '<p class="empty-state">No solves recorded yet. Add your first solve!</p>';
        return;
    }

    const recentSolves = solves.slice(0, 10);
    container.innerHTML = recentSolves.map(solve => `
        <div class="solve-item" onclick="showSolveDetails(${solve.id})" style="cursor: pointer;">
            <div>
                <div class="solve-time">${formatTime(solve.time)}</div>
                <div class="solve-date">${formatDate(solve.date)}</div>
                ${solve.scramble ? `<div class="solve-scramble">${solve.scramble}</div>` : ''}
            </div>
            ${solve.notes ? `<div class="solve-notes">${solve.notes}</div>` : ''}
        </div>
    `).join('');
}

// Statistics
function updateStats() {
    if (solves.length === 0) return;

    const times = solves.map(s => s.time);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const stdDev = Math.sqrt(times.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / times.length);

    document.getElementById('total-solves').textContent = solves.length;
    document.getElementById('avg-time').textContent = formatTime(avg);
    document.getElementById('std-dev').textContent = formatTime(stdDev);
    document.getElementById('best-time').textContent = formatTime(Math.min(...times));
    document.getElementById('worst-time').textContent = formatTime(Math.max(...times));

    updateDistributionChart();
    updateProgressChart();
}

// Chart Management
function initializeCharts() {
    const chartConfigs = {
        'best-single-chart': { label: 'Best Single', color: '#667eea' },
        'ao5-chart': { label: 'Ao5', color: '#764ba2' },
        'ao12-chart': { label: 'Ao12', color: '#f093fb' }
    };

    Object.entries(chartConfigs).forEach(([canvasId, config]) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: config.label,
                    data: [],
                    borderColor: config.color,
                    backgroundColor: config.color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatTime(value);
                            }
                        }
                    }
                }
            }
        });
    });


    updateCharts();
}

function updateCharts() {
    if (solves.length === 0) {
        console.log('No solves data available for charts');
        return;
    }

    console.log('Updating charts with', solves.length, 'solves');
    
    const timeRange = document.getElementById('time-range').value;
    const chartType = document.getElementById('chart-type').value;
    const filteredSolves = filterSolvesByTimeRange(solves, timeRange);

    console.log('Filtered solves:', filteredSolves.length);

    // Update progress charts with filtered data based on time range
    updateProgressChartData('best-single-chart', filteredSolves, 'best-single');
    updateProgressChartData('ao5-chart', filteredSolves, 'ao5');
    updateProgressChartData('ao12-chart', filteredSolves, 'ao12');
}

function updateProgressChartData(canvasId, solves, type) {
    if (solves.length === 0) {
        console.log(`No solves for ${canvasId}`);
        return;
    }

    const chart = charts[canvasId];
    if (!chart) {
        console.log(`Chart not found: ${canvasId}`);
        return;
    }

    console.log(`Updating ${canvasId} with ${solves.length} solves, type: ${type}`);
    
    const data = [];
    const labels = [];

    // Sort solves by date for proper progression
    const sortedSolves = [...solves].sort((a, b) => a.timestamp - b.timestamp);

    // Calculate rolling averages
    for (let i = 0; i < sortedSolves.length; i++) {
        const windowSolves = sortedSolves.slice(0, i + 1);
        let value;

        if (type === 'best-single') {
            value = Math.min(...windowSolves.map(s => s.time));
        } else if (type === 'ao5') {
            const averages = computeBestAverages(windowSolves);
            value = averages.bestAo5.timeMs ? averages.bestAo5.timeMs / 1000 : null;
        } else if (type === 'ao12') {
            const averages = computeBestAverages(windowSolves);
            value = averages.bestAo12.timeMs ? averages.bestAo12.timeMs / 1000 : null;
        } else {
            const n = parseInt(type.replace('ao', ''));
            value = calculateAoN(windowSolves.map(s => s.time), n);
        }

        if (value !== null && !isNaN(value)) {
            data.push(value);
            labels.push(formatDate(sortedSolves[i].date));
        }
    }

    console.log(`${canvasId} data points:`, data.length);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}


function updateDistributionChart() {
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    
    if (charts['distribution-chart']) {
        charts['distribution-chart'].destroy();
    }

    const times = solves.map(s => s.time);
    const buckets = createTimeBuckets(times);

    charts['distribution-chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: buckets.map(b => `${formatTime(b.min)}-${formatTime(b.max)}`),
            datasets: [{
                label: 'Number of Solves',
                data: buckets.map(b => b.count),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateProgressChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    if (charts['progress-chart']) {
        charts['progress-chart'].destroy();
    }

    const sortedSolves = [...solves].sort((a, b) => a.timestamp - b.timestamp);
    const labels = sortedSolves.map(s => formatDate(s.date));
    const data = sortedSolves.map(s => s.time);

    charts['progress-chart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Solve Times',
                data: data,
                borderColor: 'rgba(102, 234, 126, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 1,
                pointRadius: 2,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatTime(value);
                        }
                    }
                }
            }
        }
    });
}

// Blog Management
function handleBlogSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const category = document.getElementById('post-category').value;
    const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const content = document.getElementById('post-content').value;
    const isPrivate = document.getElementById('post-private').checked;

    const post = {
        id: Date.now(),
        title: title,
        category: category,
        tags: tags,
        content: content,
        isPrivate: isPrivate,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };

    blogPosts.push(post);
    blogPosts.sort((a, b) => b.timestamp - a.timestamp);
    
    saveData();
    renderBlogPosts();
    updateTagFilter();
    
    // Reset form and close modal
    e.target.reset();
    document.getElementById('post-modal').style.display = 'none';
}

function handlePreview() {
    const content = document.getElementById('post-content').value;
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = marked.parse(content);
    document.getElementById('preview-modal').style.display = 'block';
}

function renderBlogPosts() {
    const container = document.getElementById('blog-posts');
    const categoryFilter = document.getElementById('category-filter').value;
    const tagFilter = document.getElementById('tag-filter').value;
    const showPrivate = document.getElementById('show-private').checked;

    let filteredPosts = blogPosts;

    // Apply filters
    if (categoryFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
    }

    if (tagFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.tags.includes(tagFilter));
    }

    if (!showPrivate) {
        filteredPosts = filteredPosts.filter(post => !post.isPrivate);
    }

    if (filteredPosts.length === 0) {
        container.innerHTML = '<p class="empty-state">No blog posts found matching your filters.</p>';
        return;
    }

    container.innerHTML = filteredPosts.map(post => `
        <article class="blog-post">
            <div class="post-header">
                <div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span>${formatDate(post.date)}</span>
                        ${post.isPrivate ? '<span>🔒 Private</span>' : ''}
                    </div>
                    ${post.tags.length > 0 ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="post-content">${marked.parse(post.content)}</div>
            <div class="post-actions">
                <button class="btn btn-small btn-secondary" onclick="editPost(${post.id})">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="deletePost(${post.id})">Delete</button>
            </div>
        </article>
    `).join('');
}

function updateTagFilter() {
    const tagFilter = document.getElementById('tag-filter');
    const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
    
    tagFilter.innerHTML = '<option value="all">All Tags</option>' +
        allTags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
}

function editPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-tags').value = post.tags.join(', ');
    document.getElementById('post-content').value = post.content;
    document.getElementById('post-private').checked = post.isPrivate;

    // Remove the old post and add the updated one
    blogPosts = blogPosts.filter(p => p.id !== id);
    document.getElementById('post-modal').style.display = 'block';
}

function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogPosts = blogPosts.filter(p => p.id !== id);
        saveData();
        renderBlogPosts();
        updateTagFilter();
    }
}

// Utility Functions
function formatTime(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    
    if (minutes > 0) {
        return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
    } else {
        return `${remainingSeconds}s`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        timeZone: 'America/New_York'
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York'
    });
}

// ---------- Helpers ----------
function parseTimeToMs(s) {
    // Accepts "DNF", "12.34", "1:02.34", "1:02.345", "62.3", etc.
    if (!s || /DNF/i.test(String(s))) return null;

    const str = String(s).trim();
    if (str.includes(':')) {
        // mm:ss.xxx
        const [mm, rest] = str.split(':');
        const seconds = parseFloat(rest);
        if (Number.isNaN(seconds)) return null;
        return (parseInt(mm, 10) * 60 + seconds) * 1000;
    }
    // plain seconds with decimals
    const sec = parseFloat(str);
    if (Number.isNaN(sec)) return null;
    return sec * 1000;
}

function formatMs(ms) {
    if (ms == null) return 'DNF';
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds - minutes * 60;
    return minutes > 0
        ? `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`
        : seconds.toFixed(2);
}

// Prefer TimewithPenalty; fall back to Time if needed
function getSolveMs(solve) {
    const val = solve.timeWithPenalty ?? solve.time;
    return parseTimeToMs(val);
}

// ---------- Core Ao logic ----------
function averageWindow(timesMs, startIdx, windowSize) {
    // timesMs: array of numbers (ms) or null (DNF)
    const slice = timesMs.slice(startIdx, startIdx + windowSize);
    const dnfCount = slice.filter(v => v === null).length;

    if (dnfCount >= 2) return { avgMs: null, used: slice }; // DNF

    // Drop best (fastest) and worst (slowest). If one DNF exists, that's the worst.
    const numeric = slice.filter(v => v !== null).sort((a, b) => a - b);

    if (dnfCount === 1) {
        // Drop 1 DNF (worst) and the fastest numeric time
        if (numeric.length < windowSize - 1) return { avgMs: null, used: slice }; // safety
        const remaining = numeric.slice(1); // drop fastest
        const sum = remaining.reduce((acc, v) => acc + v, 0);
        const count = windowSize - 2; // N-2
        return { avgMs: sum / count, used: slice };
    } else {
        // No DNF: drop fastest and slowest numeric
        if (numeric.length < windowSize) return { avgMs: null, used: slice }; // safety
        const remaining = numeric.slice(1, numeric.length - 1);
        const sum = remaining.reduce((acc, v) => acc + v, 0);
        const count = windowSize - 2; // N-2
        return { avgMs: sum / count, used: slice };
    }
}

function bestAoN(timesMs, windowSize) {
    if (timesMs.length < windowSize) return { bestMs: null, start: -1, end: -1 };

    let best = { bestMs: null, start: -1, end: -1 };
    for (let i = 0; i <= timesMs.length - windowSize; i++) {
        const { avgMs } = averageWindow(timesMs, i, windowSize);
        if (avgMs !== null && (best.bestMs === null || avgMs < best.bestMs)) {
            best = { bestMs: avgMs, start: i, end: i + windowSize - 1 };
        }
    }
    return best;
}

function computeBestAverages(solves) {
    // Sort by chronological order if needed (by No or Date)
    const sorted = [...solves].sort((a, b) => {
        // Prefer No if numeric; else Date
        const aNo = Number(a.number || a.No), bNo = Number(b.number || b.No);
        if (!Number.isNaN(aNo) && !Number.isNaN(bNo)) return aNo - bNo;
        const ad = new Date(a.date || a.Date).getTime() || 0;
        const bd = new Date(b.date || b.Date).getTime() || 0;
        return ad - bd;
    });

    const timesMs = sorted.map(getSolveMs);

    const ao5 = bestAoN(timesMs, 5);
    const ao12 = bestAoN(timesMs, 12);

    return {
        bestAo5: {
            timeMs: ao5.bestMs,
            time: formatMs(ao5.bestMs),
            startIndex: ao5.start,
            endIndex: ao5.end
        },
        bestAo12: {
            timeMs: ao12.bestMs,
            time: formatMs(ao12.bestMs),
            startIndex: ao12.start,
            endIndex: ao12.end
        }
    };
}

// Legacy function for backward compatibility
function calculateAoN(times, n) {
    if (times.length < n) return null;
    
    const recent = times.slice(-n);
    const sorted = [...recent].sort((a, b) => a - b);
    
    // For Ao5: remove fastest and slowest (keep 3 middle times)
    // For Ao12: remove fastest and slowest (keep 10 middle times)
    if (n === 5) {
        sorted.shift(); // Remove fastest
        sorted.pop();   // Remove slowest
    } else if (n === 12) {
        sorted.shift(); // Remove fastest
        sorted.pop();   // Remove slowest
    }
    
    const average = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    return average;
}

function generateWcaScramble() {
    // WCA 3x3 scramble generation
    const moves = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scramble = [];
    let lastMove = '';
    let lastFace = '';
    
    // Generate 20 moves for WCA 3x3 scramble
    for (let i = 0; i < 20; i++) {
        let move, face;
        
        do {
            face = moves[Math.floor(Math.random() * moves.length)];
        } while (face === lastFace); // Avoid same face twice in a row
        
        const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        move = face + modifier;
        
        scramble.push(move);
        lastMove = move;
        lastFace = face;
    }
    
    return scramble.join(' ');
}

function generateScramble() {
    return generateWcaScramble();
}

function filterSolvesByTimeRange(solves, range) {
    if (range === 'all') return solves;
    
    const days = parseInt(range);
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return solves.filter(solve => solve.timestamp >= cutoff);
}

function getAllSolves() {
    return solves;
}

function createTimeBuckets(times) {
    const min = Math.min(...times);
    const max = Math.max(...times);
    const bucketSize = (max - min) / 10;
    
    const buckets = [];
    for (let i = 0; i < 10; i++) {
        const bucketMin = min + (i * bucketSize);
        const bucketMax = min + ((i + 1) * bucketSize);
        const count = times.filter(t => t >= bucketMin && t < bucketMax).length;
        buckets.push({ min: bucketMin, max: bucketMax, count: count });
    }
    
    return buckets;
}

// Initialize date input with current date/time and generate initial scramble
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('solve-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().slice(0, 16);
    }
    
    const scrambleInput = document.getElementById('solve-scramble');
    if (scrambleInput) {
        scrambleInput.value = generateScramble();
    }
});
