// Onboarding step 1: CV upload and wizard card selection

function selectCard(card) {
    document.querySelectorAll('.wizard-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    const btn = document.getElementById('continue-btn');
    if (btn) {
        btn.classList.remove('disabled-btn');
        btn.classList.add('enabled-btn');
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function showCvScanning(message) {
    document.getElementById('cv-dropzone')?.classList.add('d-none');
    document.getElementById('cv-scanning')?.classList.remove('d-none');
    const msg = document.getElementById('cv-scan-message');
    if (msg) msg.textContent = message;
}

function hideCvScanning() {
    document.getElementById('cv-dropzone')?.classList.remove('d-none');
    document.getElementById('cv-scanning')?.classList.add('d-none');
    document.getElementById('cv-scan-error')?.classList.add('d-none');
    document.getElementById('cv-retry-btn')?.classList.add('d-none');
}

function setCvError(message) {
    const errorBox = document.getElementById('cv-scan-error');
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.remove('d-none');
    }
    const retry = document.getElementById('cv-retry-btn');
    if (retry) retry.classList.remove('d-none');
}

async function pollCvStatus(taskId) {
    const messages = [
        'Extracting your skills...',
        'Extracting publications...',
        'Analyzing academic background...',
        'Auto-filling your data...'
    ];
    let index = 0;
    const interval = setInterval(async () => {
        showCvScanning(messages[index % messages.length]);
        index += 1;
        try {
            const response = await fetch(`/api/onboarding/cv-status/${taskId}/`, {
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error('Failed to connect to the server');
            }
            const result = await response.json();
            if (result.status === 'completed') {
                clearInterval(interval);
                sessionStorage.setItem('cv_extracted_data', JSON.stringify(result.data));
                window.location.href = '/portfolios/onboarding-two/';
                return;
            }
            if (result.status === 'failed') {
                clearInterval(interval);
                setCvError(result.error || 'Failed to analyze the file. Please try again.');
            }
        } catch (err) {
            clearInterval(interval);
            setCvError(err.message || 'Failed to connect to the analysis server.');
        }
    }, 1500);
}

async function uploadCvFile(file) {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
        setCvError('Unsupported file type. Please upload PDF or DOCX.');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        setCvError('File size exceeds 10MB.');
        return;
    }
    showCvScanning('Uploading the file to the server...');
    const formData = new FormData();
    formData.append('cv_file', file);
    try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch('/api/onboarding/upload-cv/', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin',
            headers: csrftoken ? { 'X-CSRFToken': csrftoken } : {},
        });

        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        if (!response.ok) {
            if (contentType.includes('application/json')) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || 'Upload failed.');
            }
            const text = await response.text().catch(() => null);
            throw new Error(text ? 'Upload failed: server returned an unexpected response.' : 'Upload failed.');
        }

        if (!contentType.includes('application/json')) {
            const text = await response.text().catch(() => null);
            throw new Error('Server error: expected JSON response.');
        }

        const data = await response.json();
        if (data.task_id) {
            pollCvStatus(data.task_id);
        } else {
            throw new Error('No task ID received.');
        }
    } catch (err) {
        setCvError(err.message || 'An error occurred during upload.');
    }
}

// DOM bindings for Onboarding 1 UI (wizard cards and CV dropzone)
document.addEventListener("DOMContentLoaded", () => {
    const wizardCards = document.querySelectorAll('.wizard-card');
    wizardCards.forEach(card => {
        card.addEventListener('click', function () {
            selectCard(this);
        });
    });

    const dropzone = document.getElementById('cv-dropzone');
    const fileInput = document.getElementById('cv-file-input');
    const retryButton = document.getElementById('cv-retry-btn');
    if (dropzone) {
        dropzone.addEventListener('click', () => fileInput?.click());
        dropzone.addEventListener('dragover', event => {
            event.preventDefault();
            dropzone.classList.add('drag-over');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        dropzone.addEventListener('drop', event => {
            event.preventDefault();
            dropzone.classList.remove('drag-over');
            const file = event.dataTransfer.files[0];
            if (file) uploadCvFile(file);
        });
    }
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const file = fileInput.files?.[0];
            if (file) uploadCvFile(file);
        });
    }
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            document.getElementById('cv-scan-error')?.classList.add('d-none');
            hideCvScanning();
        });
    }
});
