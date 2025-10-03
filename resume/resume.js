
    document.addEventListener('DOMContentLoaded', () => {

        const form = document.getElementById('resume-form');
        const previewContainer = document.getElementById('resume-content');
        const sectionBtns = document.querySelectorAll('.section-btn');
        const sections = document.querySelectorAll('.section-content');
        const templateBtns = document.querySelectorAll('.template-btn');
        const resumePreview = document.getElementById('resume-preview');
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        const printBtn = document.getElementById('print-btn');
        const aiButtons = document.querySelectorAll('.ai-button');
        const aiMessageBox = document.getElementById('ai-message-box');
        const runAtsBtn = document.getElementById('run-ats-btn');
        const apiKey = "AIzaSyC3ZolnvIYAhjMmz7yegS_DH3ChBQVpyGA"; // IMPORTANT: Replace with your actual API key from Google AI Studio!

        const templateFunctions = {
            classic: (data) => `
                <div class="resume-preview-container text-black classic">
                    <div class="text-center pb-4 mb-4 border-b border-gray-400">
                        <h1 class="text-3xl font-bold uppercase">${data.personal.name || 'Full Name'}</h1>
                        <p class="text-gray-600">${data.personal.title || 'Professional Title'}</p>
                        <p class="text-sm text-gray-500 mt-2">
                            ${data.personal.location || ''} ${data.personal.phone ? `| ${data.personal.phone}` : ''} | ${data.personal.email || ''}
                        </p>
                        <p class="text-sm text-gray-500">
                            ${data.personal.linkedin ? `<a href="${data.personal.linkedin}" class="hover:underline">${data.personal.linkedin}</a>` : ''}
                            ${data.personal.github ? ` | <a href="${data.personal.github}" class="hover:underline">${data.personal.github}</a>` : ''}
                        </p>
                    </div>
                    ${data.summary.text ? `
                        <div class="mb-6">
                            <h2 class="section-title">Summary</h2>
                            <p>${data.summary.text.replace(/\n/g, '<br>')}</p>
                        </div>` : ''}
                    ${data.experience.length ? `
                        <div class="mb-6">
                            <h2 class="section-title">Work Experience</h2>
                            ${data.experience.map(exp => `
                                <div class="mb-4">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-bold">${exp.job_title} at ${exp.company}</h3>
                                        <span class="text-gray-500 text-sm">${exp.start_date} - ${exp.end_date}</span>
                                    </div>
                                    <ul class="list-disc list-inside mt-1 space-y-1 text-sm">
                                        ${exp.job_description.split('\n').map(item => item.trim() ? `<li>${item.trim()}</li>` : '').join('')}
                                    </ul>
                                </div>`).join('')}
                        </div>` : ''}
                    ${data.education.length ? `
                        <div class="mb-6">
                            <h2 class="section-title">Education</h2>
                            ${data.education.map(edu => `
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 class="font-bold">${edu.degree}</h3>
                                        <p class="text-sm">${edu.school}</p>
                                    </div>
                                    <span class="text-gray-500 text-sm">${edu.edu_start} - ${edu.edu_end}</span>
                                </div>`).join('')}
                        </div>` : ''}
                    ${data.skills.length ? `
                        <div class="mb-6">
                            <h2 class="section-title">Skills</h2>
                            <p>${data.skills.join(', ')}</p>
                        </div>` : ''}
                    ${data.projects.length ? `
                        <div class="mb-6">
                            <h2 class="section-title">Projects</h2>
                            ${data.projects.map(proj => `
                                <div class="mb-4">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-bold">${proj.project_name}</h3>
                                        ${proj.project_url ? `<a href="${proj.project_url}" class="text-sm text-blue-600 hover:underline">Link</a>` : ''}
                                    </div>
                                    <ul class="list-disc list-inside mt-1 space-y-1 text-sm">
                                        ${proj.project_description.split('\n').map(item => item.trim() ? `<li>${item.trim()}</li>` : '').join('')}
                                    </ul>
                                </div>`).join('')}
                        </div>` : ''}
                    ${data.certifications.text ? `
                        <div class="mb-6">
                            <h2 class="section-title">Certifications</h2>
                            <p>${data.certifications.text}</p>
                        </div>` : ''}
                </div>
            `,
            modern: (data) => `
                <div class="resume-preview-container text-black modern">
                    <div class="bg-slate-200 text-center p-6 rounded-b-lg mb-6">
                        <h1 class="text-4xl font-bold text-slate-800">${data.personal.name || 'Full Name'}</h1>
                        <p class="text-lg text-slate-600 font-medium">${data.personal.title || 'Professional Title'}</p>
                        <div class="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm mt-3">
                            ${data.personal.location ? `<span class="flex items-center gap-1 text-slate-600"><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</span>` : ''}
                            ${data.personal.phone ? `<span class="flex items-center gap-1 text-slate-600"><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                            ${data.personal.email ? `<span class="flex items-center gap-1 text-slate-600"><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                            ${data.personal.linkedin ? `<a href="${data.personal.linkedin}" class="flex items-center gap-1 text-slate-600 hover:text-slate-800"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                            ${data.personal.github ? `<a href="${data.personal.github}" class="flex items-center gap-1 text-slate-600 hover:text-slate-800"><i class="fab fa-github"></i> GitHub</a>` : ''}
                        </div>
                    </div>
                    <div class="p-6 pt-0">
                        ${data.summary.text ? `
                            <div class="mb-6">
                                <h2 class="section-title">Summary</h2>
                                <p>${data.summary.text.replace(/\n/g, '<br>')}</p>
                            </div>` : ''}
                        ${data.experience.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Work Experience</h2>
                                ${data.experience.map(exp => `
                                    <div class="mb-4">
                                        <div class="flex justify-between items-start">
                                            <h3 class="font-bold text-base">${exp.job_title}</h3>
                                            <span class="text-gray-500 text-sm">${exp.start_date} - ${exp.end_date}</span>
                                        </div>
                                        <p class="font-medium text-sm text-gray-700">${exp.company}</p>
                                        <ul class="list-disc list-outside ml-4 mt-1 space-y-1 text-sm">
                                            ${exp.job_description.split('\n').map(item => item.trim() ? `<li>${item.trim()}</li>` : '').join('')}
                                        </ul>
                                    </div>`).join('')}
                            </div>` : ''}
                        ${data.education.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Education</h2>
                                ${data.education.map(edu => `
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 class="font-bold text-base">${edu.degree}</h3>
                                            <p class="text-sm text-gray-700">${edu.school}</p>
                                        </div>
                                        <span class="text-gray-500 text-sm">${edu.edu_start} - ${edu.edu_end}</span>
                                    </div>`).join('')}
                                </div>` : ''}
                            ${data.skills.length ? `
                                <div class="mb-6">
                                    <h2 class="section-title">Skills</h2>
                                    <p class="text-sm">${data.skills.join(', ')}</p>
                                </div>` : ''}
                            ${data.projects.length ? `
                                <div class="mb-6">
                                    <h2 class="section-title">Projects</h2>
                                    ${data.projects.map(proj => `
                                        <div class="mb-4">
                                            <div class="flex justify-between items-start">
                                                <h3 class="font-bold text-base">${proj.project_name}</h3>
                                                ${proj.project_url ? `<a href="${proj.project_url}" class="text-sm text-blue-600 hover:underline">Link</a>` : ''}
                                            </div>
                                            <ul class="list-disc list-outside ml-4 mt-1 space-y-1 text-sm">
                                                ${proj.project_description.split('\n').map(item => item.trim() ? `<li>${item.trim()}</li>` : '').join('')}
                                            </ul>
                                        </div>`).join('')}
                                </div>` : ''}
                            ${data.certifications.text ? `
                                <div class="mb-6">
                                    <h2 class="section-title">Certifications</h2>
                                    <p class="text-sm">${data.certifications.text}</p>
                            </div>` : ''}
                    </div>
                </div>
            `,
            creative: (data) => `
                <div class="resume-preview-container text-black creative">
                    <div class="flex items-center justify-center p-8 bg-slate-100 mb-6">
                        <div class="text-center">
                            <h1 class="text-4xl font-black text-slate-800 tracking-wider">${data.personal.name || 'Full Name'}</h1>
                            <p class="text-xl font-thin text-slate-600 mt-2">${data.personal.title || 'Professional Title'}</p>
                            <div class="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm mt-4 text-slate-700">
                                ${data.personal.location ? `<span class="flex items-center gap-1"><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</span>` : ''}
                                ${data.personal.phone ? `<span class="flex items-center gap-1"><i class="fas fa-phone"></i> ${data.personal.phone}</span>` : ''}
                                ${data.personal.email ? `<span class="flex items-center gap-1"><i class="fas fa-envelope"></i> ${data.personal.email}</span>` : ''}
                                ${data.personal.linkedin ? `<a href="${data.personal.linkedin}" class="flex items-center gap-1 hover:text-slate-900"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                                ${data.personal.github ? `<a href="${data.personal.github}" class="flex items-center gap-1 hover:text-slate-900"><i class="fab fa-github"></i> GitHub</a>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="p-8 pt-0">
                        ${data.summary.text ? `
                            <div class="mb-6">
                                <h2 class="section-title">Professional Summary</h2>
                                <p class="text-sm">${data.summary.text.replace(/\n/g, '<br>')}</p>
                            </div>` : ''}
                        ${data.experience.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Work Experience</h2>
                                ${data.experience.map(exp => `
                                    <div class="mb-4 relative pl-8">
                                        <div class="absolute left-0 top-0 h-full w-px bg-gray-300"></div>
                                        <div class="flex justify-between items-start mb-1">
                                            <h3 class="font-bold text-base text-slate-800">${exp.job_title} at ${exp.company}</h3>
                                            <span class="text-gray-500 text-xs font-semibold">${exp.start_date} - ${exp.end_date}</span>
                                        </div>
                                        <ul class="list-none space-y-1 text-sm">
                                            ${exp.job_description.split('\n').map(item => item.trim() ? `<li><span class="text-gray-400">&mdash;</span> ${item.trim()}</li>` : '').join('')}
                                        </ul>
                                    </div>`).join('')}
                            </div>` : ''}
                        ${data.education.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Education</h2>
                                ${data.education.map(edu => `
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 class="font-bold text-base">${edu.degree}</h3>
                                            <p class="text-sm text-gray-700">${edu.school}</p>
                                        </div>
                                        <span class="text-gray-500 text-sm">${edu.edu_start} - ${edu.edu_end}</span>
                                    </div>`).join('')}
                            </div>` : ''}
                        ${data.skills.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Skills</h2>
                                <p class="text-sm">${data.skills.join(', ')}</p>
                            </div>` : ''}
                        ${data.projects.length ? `
                            <div class="mb-6">
                                <h2 class="section-title">Projects</h2>
                                ${data.projects.map(proj => `
                                    <div class="mb-4 relative pl-8">
                                        <div class="absolute left-0 top-0 h-full w-px bg-gray-300"></div>
                                        <div class="flex justify-between items-start mb-1">
                                            <h3 class="font-bold text-base text-slate-800">${proj.project_name}</h3>
                                            ${proj.project_url ? `<a href="${proj.project_url}" class="text-sm text-blue-600 hover:underline">Link</a>` : ''}
                                        </div>
                                        <ul class="list-none space-y-1 text-sm">
                                            ${proj.project_description.split('\n').map(item => item.trim() ? `<li><span class="text-gray-400">&mdash;</span> ${item.trim()}</li>` : '').join('')}
                                        </ul>
                                    </div>`).join('')}
                            </div>` : ''}
                        ${data.certifications.text ? `
                            <div class="mb-6">
                                <h2 class="section-title">Certifications</h2>
                                <p class="text-sm">${data.certifications.text}</p>
                            </div>` : ''}
                    </div>
                </div>
            `
        };
        let activeTemplate = 'classic';

        // Initial state
        let resumeData = {
            personal: {},
            summary: {},
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: {}
        };

        // Event listeners for section buttons
        sectionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.getAttribute('data-section');
                // Hide all sections
                sections.forEach(sec => sec.classList.add('hidden'));
                // Show the selected section
                document.getElementById(sectionId + '-section').classList.remove('hidden');
                // Update active state of buttons
                sectionBtns.forEach(b => b.classList.remove('active', 'bg-slate-700'));
                btn.classList.add('active', 'bg-slate-700');
            });
        });

        // Event listeners for template buttons
        templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                activeTemplate = btn.getAttribute('data-template');
                templateBtns.forEach(b => b.classList.remove('active', 'bg-slate-700'));
                btn.classList.add('active', 'bg-slate-700');
                updatePreview();
            });
        });

        // Function to update the resume data from the form
        const updateResumeData = () => {
            const formData = new FormData(form);
            const data = {};

            // Personal Info
            data.personal = {
                name: formData.get('name') || '',
                title: formData.get('title') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                location: formData.get('location') || '',
                linkedin: formData.get('linkedin') || '',
                github: formData.get('github') || ''
            };

            // Summary
            data.summary = {
                text: formData.get('summary') || ''
            };
            
            // Certifications
            data.certifications = {
                text: formData.get('certifications') || ''
            };

            // Experience, Education, Projects (dynamic fields)
            data.experience = [];
            document.querySelectorAll('.work-experience-entry').forEach(entry => {
                const company = entry.querySelector('[name="company[]"]').value;
                const job_title = entry.querySelector('[name="job_title[]"]').value;
                const start_date = entry.querySelector('[name="start_date[]"]').value;
                const end_date = entry.querySelector('[name="end_date[]"]').value;
                const job_description = entry.querySelector('[name="job_description[]"]').value;
                if (company || job_title) {
                    data.experience.push({ company, job_title, start_date, end_date, job_description });
                }
            });

            data.education = [];
            document.querySelectorAll('.education-entry').forEach(entry => {
                const school = entry.querySelector('[name="school[]"]').value;
                const degree = entry.querySelector('[name="degree[]"]').value;
                const edu_start = entry.querySelector('[name="edu_start[]"]').value;
                const edu_end = entry.querySelector('[name="edu_end[]"]').value;
                if (school || degree) {
                    data.education.push({ school, degree, edu_start, edu_end });
                }
            });

            data.projects = [];
            document.querySelectorAll('.project-entry').forEach(entry => {
                const project_name = entry.querySelector('[name="project_name[]"]').value;
                const project_url = entry.querySelector('[name="project_url[]"]').value;
                const project_description = entry.querySelector('[name="project_description[]"]').value;
                if (project_name) {
                    data.projects.push({ project_name, project_url, project_description });
                }
            });

            // Skills
            const skillsInput = formData.get('skills') || '';
            data.skills = skillsInput.split(',').map(s => s.trim()).filter(s => s);

            resumeData = data;
            updatePreview();
        };

        // Function to render the preview
        const updatePreview = () => {
            if (templateFunctions[activeTemplate]) {
                previewContainer.innerHTML = templateFunctions[activeTemplate](resumeData);
            }
        };

        // Add more buttons
        document.getElementById('add-experience').addEventListener('click', () => {
            const container = document.getElementById('work-experience-container');
            const newEntry = document.createElement('div');
            newEntry.className = 'work-experience-entry border-b border-slate-700 pb-4 last:border-b-0';
            newEntry.innerHTML = `
                <input type="text" name="company[]" placeholder="Company Name" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <input type="text" name="job_title[]" placeholder="Job Title" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <div class="flex gap-2 mb-2">
                    <input type="text" name="start_date[]" placeholder="Start Date" class="w-1/2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <input type="text" name="end_date[]" placeholder="End Date" class="w-1/2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                </div>
                <textarea name="job_description[]" rows="4" placeholder="Job Description (use bullet points)" class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700"></textarea>
                <button type="button" class="ai-button mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-xl transition-colors duration-200 text-sm" data-ai-action="experience">
                    <i class="fas fa-magic mr-2"></i> Enhance with AI
                </button>
            `;
            container.appendChild(newEntry);
            addInputListeners();
        });

        document.getElementById('add-education').addEventListener('click', () => {
            const container = document.getElementById('education-container');
            const newEntry = document.createElement('div');
            newEntry.className = 'education-entry border-b border-slate-700 pb-4 last:border-b-0';
            newEntry.innerHTML = `
                <input type="text" name="school[]" placeholder="University/School" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <input type="text" name="degree[]" placeholder="Degree/Major" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <div class="flex gap-2 mb-2">
                    <input type="text" name="edu_start[]" placeholder="Start Year" class="w-1/2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                    <input type="text" name="edu_end[]" placeholder="End Year" class="w-1/2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                </div>
            `;
            container.appendChild(newEntry);
            addInputListeners();
        });
        
        document.getElementById('add-project').addEventListener('click', () => {
            const container = document.getElementById('projects-container');
            const newEntry = document.createElement('div');
            newEntry.className = 'project-entry border-b border-slate-700 pb-4 last:border-b-0';
            newEntry.innerHTML = `
                <input type="text" name="project_name[]" placeholder="Project Name" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <input type="url" name="project_url[]" placeholder="Project URL" class="w-full p-2 mb-2 rounded-lg bg-slate-800 border border-slate-700">
                <textarea name="project_description[]" rows="4" placeholder="Project Description (use bullet points)" class="w-full p-2 rounded-lg bg-slate-800 border border-slate-700"></textarea>
                <button type="button" class="ai-button mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-xl transition-colors duration-200 text-sm" data-ai-action="project">
                    <i class="fas fa-magic mr-2"></i> Enhance with AI
                </button>
            `;
            container.appendChild(newEntry);
            addInputListeners();
        });

        // Handle all form input changes to update preview
        const addInputListeners = () => {
            form.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', updateResumeData);
            });
             // Re-bind AI button listeners for dynamically added elements
            document.querySelectorAll('.ai-button').forEach(btn => {
                btn.removeEventListener('click', handleAiButtonClick); // Prevent multiple listeners
                btn.addEventListener('click', handleAiButtonClick);
            });
        };

        // AI assistance functions
        const showAiMessage = (message) => {
            aiMessageBox.innerHTML = `<i class="fas fa-magic text-fuchsia-300 animate-pulse"></i><span>${message}</span>`;
            aiMessageBox.classList.add('show');
        };

        const hideAiMessage = () => {
            aiMessageBox.classList.remove('show');
        };
        
        // Function to generate plain text content
        const generateTextContent = async (prompt) => {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Gemini API Error:', response.status, errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                if (result && result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    return result.candidates[0].content.parts[0].text;
                }
                 return null;
            } catch (error) {
                console.error('Error calling Gemini API for text generation:', error);
                return null;
            }
        };

        // Function to generate structured JSON content
        const generateJsonContent = async (prompt, generationConfig) => {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: generationConfig
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Gemini API Error:', response.status, errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                 if (result && result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    return result.candidates[0].content.parts[0].text;
                }
                 return null;
            } catch (error) {
                console.error('Error calling Gemini API for JSON generation:', error);
                return null;
            }
        };


        const getAiPrompt = (action, input) => {
            switch (action) {
                case 'summary':
                    return `Generate a professional summary for a resume based on the following information: ${input.name || ''}, ${input.title || ''}, and their skills: ${input.skills.join(', ')}. The summary should be concise, professional, and impactful.`;
                case 'experience':
                    return `Enhance the following job description for a resume, making it more professional and achievement-oriented. Use strong action verbs and quantify results where possible. Format as a bulleted list.\nJob Title: ${input.job_title}\nCompany: ${input.company}\nOriginal Description: ${input.job_description}`;
                case 'skills':
                    return `Suggest a list of relevant skills for a resume for a person with the professional title "${input.title || ''}" and with the following current skills: ${input.skills.join(', ')}. Provide a comma-separated list of skills only, without any other text.`;
                case 'project':
                    return `Enhance the following project description for a resume, making it professional and impactful. Use strong action verbs and quantify results. Format as a bulleted list.\nProject Name: ${input.project_name}\nOriginal Description: ${input.project_description}`;
                case 'ats-checker':
                    const fullResumeText = `Resume for ${input.name}. Professional Title: ${input.title}. Summary: ${input.summary}. Work Experience: ${input.experience}. Education: ${input.education}. Skills: ${input.skills}. Projects: ${input.projects}. Certifications: ${input.certifications}.`;
                    let atsPrompt = `Analyze the following resume text from an Applicant Tracking System (ATS) perspective. Provide a professional analysis in a structured JSON format. The analysis should include a "score" (a number from 0 to 100), a list of "keywords_found" (important terms from the resume), and a list of "suggestions" (actionable advice to improve ATS compatibility).`;

                    if (input.companyRef) {
                       atsPrompt = `Analyze the following resume text from an Applicant Tracking System (ATS) perspective, specifically tailoring the analysis for a job application at a company like **${input.companyRef}**. Provide a professional analysis in a structured JSON format. The analysis should include a "score" (a number from 0 to 100 on its suitability for ${input.companyRef}), a list of "keywords_found" (important terms from the resume), a list of "keywords_missing" (keywords relevant for ${input.companyRef} that are not on the resume), and a list of "suggestions" (actionable advice to improve ATS compatibility for ${input.companyRef}).`;
                    }
                    atsPrompt += " The response must be a valid JSON object that conforms to the provided schema. IMPORTANT: Your entire response must be ONLY the raw JSON object, without any surrounding text, explanations, or markdown formatting like ```json."
                    return `${atsPrompt}\nResume: ${fullResumeText}`;
            }
        };

        const handleAiButtonClick = async (event) => {
            const btn = event.currentTarget;
            const action = btn.getAttribute('data-ai-action');
            let prompt;
            let targetField;
            
            switch (action) {
                case 'summary':
                    const name = form.querySelector('[name="name"]').value;
                    const title = form.querySelector('[name="title"]').value;
                    const skills = form.querySelector('[name="skills"]').value.split(',').map(s => s.trim());
                    prompt = getAiPrompt('summary', { name, title, skills });
                    targetField = form.querySelector('[name="summary"]');
                    break;
                case 'experience':
                    const entry = btn.closest('.work-experience-entry');
                    const jobTitle = entry.querySelector('[name="job_title[]"]').value;
                    const company = entry.querySelector('[name="company[]"]').value;
                    const jobDescription = entry.querySelector('[name="job_description[]"]').value;
                    prompt = getAiPrompt('experience', { job_title: jobTitle, company, job_description: jobDescription });
                    targetField = entry.querySelector('[name="job_description[]"]');
                    break;
                case 'skills':
                    const currentTitle = form.querySelector('[name="title"]').value;
                    const currentSkills = form.querySelector('[name="skills"]').value.split(',').map(s => s.trim());
                    prompt = getAiPrompt('skills', { title: currentTitle, skills: currentSkills });
                    targetField = form.querySelector('[name="skills"]');
                    break;
                case 'project':
                    const projectEntry = btn.closest('.project-entry');
                    const projectName = projectEntry.querySelector('[name="project_name[]"]').value;
                    const projectDescription = projectEntry.querySelector('[name="project_description[]"]').value;
                    prompt = getAiPrompt('project', { project_name: projectName, project_description: projectDescription });
                    targetField = projectEntry.querySelector('[name="project_description[]"]');
                    break;
            }

            if (prompt && targetField) {
                showAiMessage('Generating with AI...');
                const generatedText = await generateTextContent(prompt);
                if (generatedText) {
                    targetField.value = generatedText;
                    updateResumeData();
                    hideAiMessage();
                } else {
                    showAiMessage('Error generating content. Try again.');
                    setTimeout(hideAiMessage, 3000);
                }
            } else {
                showAiMessage('Please fill in required fields first.');
                setTimeout(hideAiMessage, 3000);
            }
        };

        // ATS Checker functionality
        runAtsBtn.addEventListener('click', async () => {
            const reportDiv = document.getElementById('ats-report');
            reportDiv.innerHTML = '<div class="text-center"><i class="fas fa-sync-alt fa-spin text-sky-400 text-xl"></i><p class="mt-2 text-sm text-gray-400">Analyzing resume...</p></div>';

            const companyRef = document.getElementById('ats-company-ref').value;
            const prompt = getAiPrompt('ats-checker', {
                name: resumeData.personal.name,
                title: resumeData.personal.title,
                summary: resumeData.summary.text,
                experience: resumeData.experience.map(exp => `${exp.job_title} at ${exp.company}: ${exp.job_description}`).join('\n'),
                education: resumeData.education.map(edu => `${edu.degree} from ${edu.school}`).join('\n'),
                skills: resumeData.skills.join(', '),
                projects: resumeData.projects.map(proj => `${proj.project_name}: ${proj.project_description}`).join('\n'),
                certifications: resumeData.certifications.text,
                companyRef: companyRef
            });
            
            const generationConfig = {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "score": { "type": "NUMBER" },
                            "keywords_found": { "type": "ARRAY", "items": { "type": "STRING" } },
                            "keywords_missing": { "type": "ARRAY", "items": { "type": "STRING" } },
                            "suggestions": { "type": "ARRAY", "items": { "type": "STRING" } }
                        }
                    }
                };

            const result = await generateJsonContent(prompt, generationConfig);
            if (result) {
                try {
                    // Sometimes the API returns the JSON wrapped in markdown ` ```json ... ``` ` or with other text.
                    // This will extract the raw JSON string before parsing.
                    const startIndex = result.indexOf('{');
                    const endIndex = result.lastIndexOf('}');
                    if (startIndex === -1 || endIndex === -1) {
                        throw new Error("No valid JSON object found in the AI response.");
                    }
                    const jsonString = result.substring(startIndex, endIndex + 1);
                    const atsReport = JSON.parse(jsonString);

                    // Render the report
                    reportDiv.innerHTML = `
                        <div class="space-y-4">
                            <div class="flex items-center gap-4">
                                <div class="relative w-16 h-16">
                                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle class="text-gray-700 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                        <circle class="text-sky-400 stroke-current progress-ring__circle" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent"
                                            style="stroke-dasharray: 251.2; stroke-dashoffset: ${251.2 - (atsReport.score / 100) * 251.2};"></circle>
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                                        ${atsReport.score}
                                    </div>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold">ATS Score: ${atsReport.score}/100</h3>
                                    <p class="text-sm text-gray-400">${atsReport.score >= 70 ? 'Excellent! This resume is highly compatible.' : 'Good, but there is room for improvement.'}</p>
                                </div>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-2">Keywords Found:</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${atsReport.keywords_found.map(keyword => `<span class="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">${keyword}</span>`).join('')}
                                </div>
                            </div>
                            ${atsReport.keywords_missing && atsReport.keywords_missing.length > 0 ?
                            `<div>
                                <h4 class="font-semibold mb-2 mt-4">Keywords Missing for ${companyRef || 'Target Role'}:</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${atsReport.keywords_missing.map(keyword => `<span class="bg-yellow-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">${keyword}</span>`).join('')}
                                </div>
                            </div>` : ''}
                            <div>
                                <h4 class="font-semibold mb-2 mt-4">Suggestions for Improvement:</h4>
                                <ul class="list-disc list-inside space-y-1 text-sm">
                                    ${atsReport.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `;
                } catch (e) {
                    console.error('Failed to parse JSON:', e, "Raw response:", result);
                    reportDiv.innerHTML = '<p class="text-red-400">Failed to generate a report. The AI response was not valid JSON. Please try again.</p>';
                }
            } else {
                reportDiv.innerHTML = '<p class="text-red-400">Failed to generate a report. Please try again.</p>';
            }
        });

        // PDF download functionality
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('resume-preview');
            const scale = 2;
            html2pdf(element, {
                margin: 10,
                filename: 'resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: scale, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            });
        });

        // Print functionality
        printBtn.addEventListener('click', () => {
            window.print();
        });

        // Initial call to set up event listeners and render the initial preview
        addInputListeners();
        updatePreview();

        // Set the active class on the initial template button
        document.querySelector('.template-btn.active').classList.add('bg-slate-700');
    });
