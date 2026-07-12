// Shared utilities used across multiple pages

let tags = [];

function setFormValue(selector, value) {
    const el = document.querySelector(selector);
    if (!el || value == null) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
}

function showAutoFillToast(message) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 m-4 p-3 rounded-3 bg-success text-white shadow';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function renderTags() {
    const tagBox = document.getElementById('tag-box');
    const tagInput = document.getElementById('tag-input');
    const tagVal = document.getElementById('research-interests-val');
    if (!tagBox || !tagInput || !tagVal) return;

    tagBox.querySelectorAll('.tag-item').forEach(el => el.remove());
    tags.forEach((t, i) => {
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.innerHTML = t + ' <span class="remove-tag" onclick="removeTag(' + i + ')">×</span>';
        tagBox.insertBefore(span, tagInput);
    });
    tagVal.value = tags.join(',');
    // may be defined on onboarding pages
    if (typeof updateStepButtons === 'function') updateStepButtons();
}

function removeTag(i) {
    tags.splice(i, 1);
    renderTags();
}

function refreshPreview() {
    const frame = document.getElementById('preview-frame');
    if (frame) frame.src = frame.src;
}
