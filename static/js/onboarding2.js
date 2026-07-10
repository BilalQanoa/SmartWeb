// Onboarding step 2: multi-step wizard, repeatable formsets, validation

let TOTAL = 0;
let sectionDone = [];
let current = 0;
let pubCount = 1;
let courseCount = 1;

function updateRepeatableSectionTitles() {
    document.querySelectorAll('.edu-row').forEach((row, index) => {
        const label = row.querySelector('.repeatable-card-title');
        if (label) label.textContent = `Education #${index + 1}`;
    });
    document.querySelectorAll('.pub-row').forEach((row, index) => {
        const label = row.querySelector('.repeatable-card-title');
        if (label) label.textContent = `Publication #${index + 1}`;
    });
    document.querySelectorAll('.teach-row').forEach((row, index) => {
        const label = row.querySelector('.repeatable-card-title');
        if (label) label.textContent = `Teaching #${index + 1}`;
    });
}

function addPublicationRow(item = {}) {
    const c = document.getElementById('pub-container');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'pub-row repeatable-card';
    div.innerHTML = `
        <div class="repeatable-card-header">
            <div class="repeatable-card-title">Publication #${c.querySelectorAll('.pub-row').length + 1}</div>
            <button type="button" class="remove-row-btn" onclick="this.closest('.pub-row').remove(); updateStepButtons(); updateRepeatableSectionTitles();"><i class="bi bi-trash"></i></button>
        </div>
        <div class="row g-3">
            <div class="col-md-8">
                <label class="form-label fw-semibold small">Title <span class="text-danger">*</span></label>
                <input type="text" name="pub_title[]" class="form-control pub-required" placeholder="Publication title" value="${item.title || ''}">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold small">Date</label>
                <input type="date" name="pub_date[]" class="form-control" value="${item.publication_date || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">PDF Link</label>
                <input type="url" name="pub_pdf[]" class="form-control" placeholder="https://..." value="${item.pdf_link || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">GitHub Link</label>
                <input type="url" name="pub_github[]" class="form-control" placeholder="https://github.com/..." value="${item.github_link || ''}">
            </div>
        </div>`;
    c.appendChild(div);
    syncValidation();
}

function addTeachingRow(item = {}) {
    const c = document.getElementById('teach-container');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'teach-row repeatable-card';
    div.innerHTML = `
        <div class="repeatable-card-header">
            <div class="repeatable-card-title">Teaching #${c.querySelectorAll('.teach-row').length + 1}</div>
            <button type="button" class="remove-row-btn" onclick="this.closest('.teach-row').remove(); updateStepButtons(); updateRepeatableSectionTitles();"><i class="bi bi-trash"></i></button>
        </div>
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Course Name</label>
                <input type="text" name="course_name[]" class="form-control" placeholder="e.g. Machine Learning 101" value="${item.course_name || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Semester</label>
                <input type="text" name="semester[]" class="form-control" placeholder="e.g. Fall 2024" value="${item.semester || ''}">
            </div>
            <div class="col-md-8">
                <label class="form-label fw-semibold small">Description</label>
                <textarea name="course_desc[]" class="form-control" rows="2" placeholder="Course description…">${item.description || ''}</textarea>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold small">Syllabus Link</label>
                <input type="url" name="syllabus_link[]" class="form-control" placeholder="https://..." value="${item.syllabus_link || ''}">
            </div>
        </div>`;
    c.appendChild(div);
    syncValidation();
}

function addEducationRow(item = {}) {
    const c = document.getElementById('edu-container');
    if (!c) return;
    const empty = document.getElementById('edu-empty')?.innerHTML;
    const totalInput = document.querySelector('input[name*="education"][name$="-TOTAL_FORMS"]');
    let index = 0;
    if (totalInput) {
        index = parseInt(totalInput.value, 10);
    }
    if (empty) {
        const html = empty.replace(/__prefix__/g, index);
        const wrapper = document.createElement('div');
        wrapper.className = 'edu-row repeatable-card';
        wrapper.innerHTML = `<div class="repeatable-card-header"><div class="repeatable-card-title">Education #${c.querySelectorAll('.edu-row').length + 1}</div><button type="button" class="remove-row-btn" onclick="this.closest('.edu-row').remove(); updateStepButtons(); updateRepeatableSectionTitles();"><i class="bi bi-trash"></i></button></div>${html}`;
        c.appendChild(wrapper);
        if (totalInput) totalInput.value = index + 1;
        syncValidation();
        updateRepeatableSectionTitles();
        return;
    }

    const div = document.createElement('div');
    div.className = 'edu-row repeatable-card';
    div.innerHTML = `
        <div class="repeatable-card-header">
            <div class="repeatable-card-title">Education #${c.querySelectorAll('.edu-row').length + 1}</div>
            <button type="button" class="remove-row-btn" onclick="this.closest('.edu-row').remove(); updateStepButtons(); updateRepeatableSectionTitles();"><i class="bi bi-trash"></i></button>
        </div>
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Degree</label>
                <input type="text" name="edu_degree[]" class="form-control" value="${item.degree || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Field of Study</label>
                <input type="text" name="edu_field[]" class="form-control" value="${item.field_of_study || ''}">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Institution</label>
                <input type="text" name="edu_institution[]" class="form-control" value="${item.institution || ''}">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold small">Start Year</label>
                <input type="number" name="edu_start[]" class="form-control" value="${item.start_year || ''}">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-semibold small">End Year</label>
                <input type="number" name="edu_end[]" class="form-control" value="${item.end_year || ''}">
            </div>
            <div class="col-md-12">
                <label class="form-label fw-semibold small">Description</label>
                <textarea name="edu_description[]" class="form-control" rows="2">${item.description || ''}</textarea>
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Honor</label>
                <input type="text" name="edu_honor[]" class="form-control" value="${item.honor || ''}">
            </div>
        </div>`;
    c.appendChild(div);
    syncValidation();
}

function initializeOnboarding2FromSession() {
    const rawData = sessionStorage.getItem('cv_extracted_data');
    if (!rawData) return;
    let extracted;
    try {
        extracted = JSON.parse(rawData);
    } catch (err) {
        return;
    }
    sessionStorage.removeItem('cv_extracted_data');

    setFormValue('input[name="full_name"]', extracted.profile.full_name || '');
    setFormValue('input[name="academic_title"]', extracted.profile.academic_title || '');
    setFormValue('input[name="institution"]', extracted.profile.institution || '');
    setFormValue('input[name="field_of_study"]', extracted.profile.field_of_study || '');
    setFormValue('input[name="tagline"]', extracted.profile.tagline || '');
    setFormValue('textarea[name="bio"]', extracted.profile.bio || '');
    setFormValue('input[name="google_scholar"]', extracted.profile.google_scholar || '');
    setFormValue('input[name="research_gate"]', extracted.profile.research_gate || '');

    if (extracted.profile.research_interests) {
        tags = extracted.profile.research_interests.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
        renderTags();
    }

    if (Array.isArray(extracted.publications) && extracted.publications.length) {
        const first = extracted.publications[0];
        if (document.querySelector('input[name="publications-0-title"]')) {
            setFormValue('input[name="publications-0-title"]', first.title || '');
            setFormValue('input[name="publications-0-publication_date"]', first.publication_date || '');
            setFormValue('input[name="publications-0-pdf_link"]', first.pdf_link || '');
            setFormValue('input[name="publications-0-github_link"]', first.github_link || '');
            extracted.publications.slice(1).forEach(item => {
                addPub();
                const rows = document.querySelectorAll('#pub-container .pub-row');
                const idx = rows.length - 1;
                setFormValue(`input[name="publications-${idx}-title"]`, item.title || '');
                setFormValue(`input[name="publications-${idx}-publication_date"]`, item.publication_date || '');
                setFormValue(`input[name="publications-${idx}-pdf_link"]`, item.pdf_link || '');
                setFormValue(`input[name="publications-${idx}-github_link"]`, item.github_link || '');
            });
        } else {
            extracted.publications.slice(1).forEach(addPublicationRow);
        }
    }

    if (Array.isArray(extracted.teaching) && extracted.teaching.length) {
        const first = extracted.teaching[0];
        if (document.querySelector('input[name="teachings-0-course_name"]')) {
            setFormValue('input[name="teachings-0-course_name"]', first.course_name || '');
            setFormValue('input[name="teachings-0-semester"]', first.semester || '');
            setFormValue('textarea[name="teachings-0-description"]', first.description || '');
            setFormValue('input[name="teachings-0-syllabus_link"]', first.syllabus_link || '');
            extracted.teaching.slice(1).forEach(item => {
                addCourse();
                const rows = document.querySelectorAll('#teach-container .teach-row');
                const idx = rows.length - 1;
                setFormValue(`input[name="teachings-${idx}-course_name"]`, item.course_name || '');
                setFormValue(`input[name="teachings-${idx}-semester"]`, item.semester || '');
                setFormValue(`textarea[name="teachings-${idx}-description"]`, item.description || '');
                setFormValue(`input[name="teachings-${idx}-syllabus_link"]`, item.syllabus_link || '');
            });
        } else {
            extracted.teaching.slice(1).forEach(addTeachingRow);
        }
    }

    if (Array.isArray(extracted.education) && extracted.education.length) {
        const degreeInputs = document.querySelectorAll('input[name$="-degree"]');
        if (degreeInputs && degreeInputs.length) {
            extracted.education.forEach((item, idx) => {
                const suffix = `-${idx}-degree`;
                const deg = document.querySelector(`input[name$="${suffix}"]`);
                if (deg) {
                    deg.value = item.degree || '';
                    const field = document.querySelector(`input[name$="-${idx}-field_of_study"]`);
                    if (field) field.value = item.field_of_study || '';
                    const inst = document.querySelector(`input[name$="-${idx}-institution"]`);
                    if (inst) inst.value = item.institution || '';
                    const st = document.querySelector(`input[name$="-${idx}-start_year"]`);
                    if (st) st.value = item.start_year || '';
                    const en = document.querySelector(`input[name$="-${idx}-end_year"]`);
                    if (en) en.value = item.end_year || '';
                    const desc = document.querySelector(`textarea[name$="-${idx}-description"]`);
                    if (desc) desc.value = item.description || '';
                    const honor = document.querySelector(`input[name$="-${idx}-honor"]`);
                    if (honor) honor.value = item.honor || '';
                } else {
                    addEducationRow(item);
                }
            });
        } else {
            extracted.education.forEach(addEducationRow);
        }
    }

    const researchEntries = Array.isArray(extracted.research_interests_entries) ? extracted.research_interests_entries : [];
    const filledCount = [
        extracted.profile.full_name,
        extracted.profile.academic_title,
        extracted.profile.institution,
        extracted.profile.field_of_study,
        extracted.profile.tagline,
        extracted.profile.bio,
        extracted.profile.google_scholar,
        extracted.profile.research_gate,
        extracted.profile.research_interests,
    ].filter(Boolean).length +
        (Array.isArray(extracted.publications) ? extracted.publications.filter(item => item.title).length : 0) +
        (Array.isArray(extracted.teaching) ? extracted.teaching.filter(item => item.course_name).length : 0) +
        (Array.isArray(extracted.education) ? extracted.education.filter(item => item.degree || item.institution).length : 0) +
        researchEntries.filter(item => item.title).length;

    showAutoFillToast(`Auto-filled ${filledCount} fields ✅`);
}

function showSection(idx) {
    document.querySelectorAll('.wizard-section').forEach((el, i) => {
        el.style.display = i === idx ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar-step').forEach((el, i) => {
        const isActive = i === idx;
        el.classList.toggle('active', isActive);
        el.classList.toggle('bg-primary', isActive);
        el.classList.toggle('text-white', isActive);
        if (isActive) {
            el.classList.remove('btn-outline-secondary');
        } else {
            el.classList.remove('bg-primary', 'text-white');
            el.classList.add('btn-outline-secondary');
        }
    });
    current = idx;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function jumpTo(idx) {
    showSection(idx);
}

function sectionValid(idx) {
    const sec = document.getElementById('section-' + idx);
    if (!sec) return true;
    let ok = true;
    sec.querySelectorAll('input[required], textarea[required]').forEach(el => {
        const value = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value.trim();
        if (!value) {
            el.classList.add('is-invalid');
            ok = false;
        } else {
            el.classList.remove('is-invalid');
        }
    });
    return ok;
}

function validateEducationSection() {
    const educationRows = document.querySelectorAll('#edu-container .edu-row');
    let hasInvalidRow = false;

    educationRows.forEach(row => {
        const startYearInput = row.querySelector('input[name$="-start_year"], input[name$="start_year"]');
        const inlineError = row.querySelector('.education-inline-error');
        const otherFields = Array.from(row.querySelectorAll('input, textarea')).filter(el => {
            if (!el.name) return false;
            if (el.name.includes('start_year') || el.name.includes('end_year')) return false;
            if (el.type === 'hidden') return false;
            return el.value.trim() !== '';
        });

        const hasAnyContent = otherFields.length > 0;
        const hasStartYear = !!(startYearInput && startYearInput.value && String(startYearInput.value).trim() !== '');

        if (hasAnyContent && !hasStartYear) {
            hasInvalidRow = true;
            startYearInput?.classList.add('is-invalid');
            if (inlineError) {
                inlineError.textContent = 'Start year is required for this entry.';
                inlineError.classList.remove('d-none');
            }
        } else {
            startYearInput?.classList.remove('is-invalid');
            if (inlineError) {
                inlineError.textContent = '';
                inlineError.classList.add('d-none');
            }
        }
    });

    return !hasInvalidRow;
}

function nextSection(idx) {
    if (idx === 2) {
        if (!validateEducationSection()) {
            console.warn('Education validation failed, staying on section', idx);
            showSection(2);
            return;
        }
    }
    if (!sectionValid(idx)) {
        console.warn('Section validation prevented navigation', idx);
        return;
    }
    if (idx + 1 < TOTAL) showSection(idx + 1);
}

function prevSection(idx) {
    if (idx > 0) {
        showSection(idx - 1);
    }
}

function getSectionRequiredFields(section) {
    return section.querySelectorAll('input[required], textarea[required], select[required]');
}

function updateStepButtons() {
    document.querySelectorAll('.wizard-section').forEach((section, idx) => {
        const nextButton = document.querySelector(`[data-wizard-next='${idx}']`);
        if (!nextButton) return;
        const requiredFields = getSectionRequiredFields(section);
        let done = false;
        if (requiredFields.length === 0) {
            nextButton.disabled = false;
            done = sectionHasContent(section);
        } else {
            const valid = Array.from(requiredFields).every(el => {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    return el.checked;
                }
                return String(el.value || '').trim();
            });
            nextButton.disabled = !valid;
            done = valid;
        }
        setSectionDone(idx, done);
    });
}

function isFormsetInternalHiddenInput(el) {
    if (el.type !== 'hidden' || !el.name) return false;
    if (el.name.indexOf('TOTAL_FORMS') !== -1 || el.name.indexOf('INITIAL_FORMS') !== -1 || el.name.indexOf('MIN_NUM_FORMS') !== -1 || el.name.indexOf('MAX_NUM_FORMS') !== -1 || el.name.indexOf('__prefix__') !== -1) return true;
    return /-(id|profile)$/.test(el.name);
}

function sectionHasContent(section) {
    if (!section) return false;
    const inputs = section.querySelectorAll('input, textarea, select');
    for (const el of inputs) {
        if (!el.name) continue;
        // skip management/formset hidden inputs and internal formset metadata fields
        if (isFormsetInternalHiddenInput(el)) continue;
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) return true;
            continue;
        }
        if (el.value && String(el.value).trim() !== '') return true;
    }
    // also check legacy repeatable containers for non-formset setups
    const pubRows = section.querySelectorAll('#pub-container .pub-row, .pub-row');
    for (const r of pubRows) {
        const v = r.querySelector('input, textarea');
        if (v && String(v.value || '').trim() !== '') return true;
    }
    const teachRows = section.querySelectorAll('#teach-container .teach-row, .teach-row');
    for (const r of teachRows) {
        const v = r.querySelector('input, textarea');
        if (v && String(v.value || '').trim() !== '') return true;
    }
    return false;
}

function setSectionDone(idx, done) {
    sectionDone[idx] = !!done;
    const dot = document.getElementById('dot-' + idx);
    if (!dot) return;
    if (done) {
        dot.classList.add('done');
        dot.innerHTML = '<i class="bi bi-check-lg" style="font-size:.65rem;"></i>';
    } else {
        dot.classList.remove('done');
        dot.innerHTML = '';
    }
    updateProgress();
    checkAllDone();
}

function updateProgress() {
    const completionPct = document.getElementById('completion-pct');
    const completionBar = document.getElementById('completion-bar');
    const totalSteps = TOTAL || document.querySelectorAll('.sidebar-step').length || 0;
    if (!completionPct || !completionBar || totalSteps === 0) return;

    const completedSteps = sectionDone.filter(Boolean).length;
    const percent = Math.round((completedSteps / totalSteps) * 100);

    completionPct.textContent = `${percent}% complete`;
    completionBar.style.width = `${percent}%`;
    completionBar.setAttribute('aria-valuenow', percent);
}

function checkAllDone() {
    return sectionDone.length > 0 && sectionDone.every(Boolean);
}

function updateFinalContactState() {
    const submitBtn = document.getElementById('go-step3-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
    checkAllDone();
}

function handleWizardFieldChange(event) {
    const el = event.target;
    if (el.type !== 'checkbox' && el.type !== 'radio' && el.value && String(el.value).trim()) {
        el.classList.remove('is-invalid');
    }
    updateStepButtons();
    updateFinalContactState();
}

function syncValidation() {
    document.querySelectorAll('.wizard-section input, .wizard-section textarea, .wizard-section select').forEach(el => {
        el.removeEventListener('input', handleWizardFieldChange);
        el.removeEventListener('change', handleWizardFieldChange);
        el.addEventListener('input', handleWizardFieldChange);
        el.addEventListener('change', handleWizardFieldChange);
    });

    document.querySelectorAll('input[name="google_scholar"], input[name="research_gate"]').forEach(el => {
        el.removeEventListener('input', updateFinalContactState);
        el.removeEventListener('change', updateFinalContactState);
        el.addEventListener('input', updateFinalContactState);
        el.addEventListener('change', updateFinalContactState);
    });
}

// Tag input and other DOM bindings for onboarding2
document.addEventListener("DOMContentLoaded", () => {
    // Tag input listener
    const tagInput = document.getElementById('tag-input');
    const tagVal = document.getElementById('research-interests-val');
    if (tagVal && tagVal.value.trim()) {
        tags = tagVal.value.split(/[,\n]+/).map(t => t.trim()).filter(Boolean);
        renderTags();
    }
    if (tagInput) {
        tagInput.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
                e.preventDefault();
                tags.push(tagInput.value.trim().replace(/,$/, ''));
                tagInput.value = '';
                renderTags();
            }
        });
    }

    const tagBox = document.getElementById('tag-box');
    if (tagBox) {
        tagBox.addEventListener('click', () => {
            const tagInput = document.getElementById('tag-input');
            if (tagInput) tagInput.focus();
        });
    }

    // Photo preview listener
    const fileInput = document.getElementById('profile-image-input') || document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const f = this.files[0];
            if (!f) return;
            const wrap = document.getElementById('photo-preview-wrap');
            if (!wrap) return;
            const reader = new FileReader();
            reader.onload = e => {
                wrap.innerHTML = '<img src="' + e.target.result + '" alt="preview" class="rounded-circle" style="width:100%; height:100%; object-fit:cover;">';
            };
            reader.readAsDataURL(f);
        });
    }

    const nextButtons = document.querySelectorAll('[data-wizard-next]');
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const idx = Number(button.dataset.wizardNext);
            if (!Number.isNaN(idx)) nextSection(idx);
        });
    });

    const prevButtons = document.querySelectorAll('[data-wizard-prev]');
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            const idx = Number(button.dataset.wizardPrev);
            if (!Number.isNaN(idx)) prevSection(idx);
        });
    });

    const sidebarSteps = document.querySelectorAll('.sidebar-step');
    sidebarSteps.forEach(button => {
        button.addEventListener('click', () => {
            const idx = Number(button.dataset.step);
            if (!Number.isNaN(idx)) showSection(idx);
        });
    });

    syncValidation();

    // Debug: log form data when submit is clicked to help diagnose client-side issues
    const step2Form = document.getElementById('step2-form');
    const submitBtn = document.getElementById('go-step3-btn');
    if (submitBtn && step2Form) {
        submitBtn.addEventListener('click', (e) => {
            try {
                console.log('SUBMIT CLICKED', new FormData(step2Form));
            } catch (err) {
                console.log('SUBMIT CLICKED - could not build FormData', err);
            }
        });
    }

    const addPubButton = document.querySelector('[data-add-pub]');
    if (addPubButton) addPubButton.addEventListener('click', addPub);

    const addCourseButton = document.querySelector('[data-add-course]');
    if (addCourseButton) addCourseButton.addEventListener('click', addCourse);
    const addEduButton = document.querySelector('[data-add-edu]');
    if (addEduButton) addEduButton.addEventListener('click', () => addEducationRow());

    // Init wizard on onboarding2 page and autofill if the CV extractor returned data.
    if (document.getElementById('step2-form')) {
        // compute TOTAL based on sidebar items
        TOTAL = document.querySelectorAll('.sidebar-step').length || 0;
        sectionDone = new Array(TOTAL).fill(false);

        initializeOnboarding2FromSession();
        const shouldFocusEducation = document.querySelector('[data-focus-education]')?.dataset.focusEducation === 'true';
        if (shouldFocusEducation) {
            showSection(2);
        } else {
            showSection(0);
        }
        updateStepButtons();
    }
});

function addPub() {
    const c = document.getElementById('pub-container');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'pub-row';
    div.id = 'pub-' + pubCount;
    div.innerHTML = `
        <button type="button" class="remove-row-btn" onclick="this.closest('.pub-row').remove(); updateStepButtons();"><i class="bi bi-trash"></i></button>
        <div class="row g-3">
            <div class="col-md-8">
                <label class="form-label fw-semibold small">Title <span class="text-danger">*</span></label>
                <input type="text" name="pub_title[]" class="form-control pub-required" placeholder="Publication title">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold small">Date</label>
                <input type="date" name="pub_date[]" class="form-control">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">PDF Link</label>
                <input type="url" name="pub_pdf[]" class="form-control" placeholder="https://...">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">GitHub Link</label>
                <input type="url" name="pub_github[]" class="form-control" placeholder="https://github.com/...">
            </div>
        </div>`;
    c.appendChild(div);
    pubCount++;
    syncValidation();
}

function addCourse() {
    const c = document.getElementById('teach-container');
    if (!c) return;
    const totalInput = document.querySelector('input[name="teachings-TOTAL_FORMS"]');
    let index = 0;
    if (totalInput) index = parseInt(totalInput.value, 10);
    const empty = document.getElementById('teach-empty')?.innerHTML;
    if (empty) {
        const html = empty.replace(/__prefix__/g, index);
        const wrapper = document.createElement('div');
        wrapper.className = 'teach-row repeatable-card';
        wrapper.innerHTML = `<div class="repeatable-card-header"><div class="repeatable-card-title">Teaching #${c.querySelectorAll('.teach-row').length + 1}</div><button type="button" class="remove-row-btn" onclick="this.closest('.teach-row').remove(); updateStepButtons(); updateRepeatableSectionTitles();"><i class="bi bi-trash"></i></button></div><div class="row g-3">${html}</div>`;
        c.appendChild(wrapper);
        if (totalInput) totalInput.value = index + 1;
        syncValidation();
        updateRepeatableSectionTitles();
        return;
    }

    const div = document.createElement('div');
    div.className = 'teach-row';
    div.id = 'teach-' + courseCount;
    div.innerHTML = `
        <button type="button" class="remove-row-btn" onclick="this.closest('.teach-row').remove(); updateStepButtons();"><i class="bi bi-trash"></i></button>
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Course Name</label>
                <input type="text" name="course_name[]" class="form-control" placeholder="e.g. Machine Learning 101">
            </div>
            <div class="col-md-6">
                <label class="form-label fw-semibold small">Semester</label>
                <input type="text" name="semester[]" class="form-control" placeholder="e.g. Fall 2024">
            </div>
            <div class="col-md-8">
                <label class="form-label fw-semibold small">Description</label>
                <textarea name="course_desc[]" class="form-control" rows="2" placeholder="Course description…"></textarea>
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold small">Syllabus Link</label>
                <input type="url" name="syllabus_link[]" class="form-control" placeholder="https://...">
            </div>
        </div>`;
    c.appendChild(div);
    courseCount++;
    syncValidation();
}
