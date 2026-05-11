document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const adminHeader = document.getElementById('admin-header');
    const loginForm = document.getElementById('login-form');
    const patInput = document.getElementById('pat-input');
    const logoutBtn = document.getElementById('logout-btn');
    
    const uploadForm = document.getElementById('upload-form');
    const uploadBtn = document.getElementById('upload-btn');
    const galleryGrid = document.getElementById('gallery-grid');
    const refreshBtn = document.getElementById('refresh-gallery-btn');
    const alertBox = document.getElementById('alert-box');
    
    // GitHub Repo Configuration
    const owner = 'DjAhnaf17';
    const repo = 'royalsuppliersvnb';
    let currentPat = localStorage.getItem('github_pat');

    // Initialization
    if (currentPat) {
        showDashboard();
    } else {
        showLogin();
    }

    // --- Authentication ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pat = patInput.value.trim();
        if (pat) {
            localStorage.setItem('github_pat', pat);
            currentPat = pat;
            showDashboard();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('github_pat');
        currentPat = null;
        patInput.value = '';
        showLogin();
    });

    function showLogin() {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
        adminHeader.classList.add('d-none');
    }

    function showDashboard() {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        adminHeader.classList.remove('d-none');
        loadGallery();
    }

    // --- Gallery Management ---
    refreshBtn.addEventListener('click', loadGallery);

    async function loadGallery() {
        galleryGrid.innerHTML = '<div class="text-center w-100 text-muted py-5 col-span-full"><div class="spinner-border text-gold mb-3"></div><br>Loading gallery...</div>';
        try {
            const { currentGallery } = await getGalleryJson();
            
            if (currentGallery.length === 0) {
                galleryGrid.innerHTML = '<div class="text-center w-100 text-muted py-5 col-span-full">Gallery is empty. Upload an image to start!</div>';
                return;
            }

            galleryGrid.innerHTML = '';
            currentGallery.forEach(filename => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                // Add timestamp to bypass browser cache
                item.innerHTML = `
                    <img src="static/ImagesCarousel/${filename}?t=${new Date().getTime()}" alt="Gallery Image" onerror="this.src='https://via.placeholder.com/400x400/0b0f19/d4af37?text=Image+Not+Found'">
                    <button class="delete-btn" data-filename="${filename}"><i class="bi bi-trash-fill"></i></button>
                `;
                galleryGrid.appendChild(item);
            });

            // Attach delete listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteImage(e.currentTarget.getAttribute('data-filename')));
            });

        } catch (error) {
            console.error(error);
            galleryGrid.innerHTML = `<div class="text-center w-100 text-danger py-5 col-span-full">Error loading gallery: ${error.message}</div>`;
        }
    }

    // --- Upload Logic ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fileInput = document.getElementById('gallery-image');
        const file = fileInput.files[0];
        if (!file || !currentPat) return;

        const originalBtnText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Uploading...';
        uploadBtn.disabled = true;
        hideAlert();

        try {
            const base64Content = await getBase64(file);
            const cleanBase64 = base64Content.split(',')[1];
            
            const timestamp = new Date().getTime();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const newFilename = `${timestamp}_${safeName}`;
            
            // 1. Upload Image File
            const imagePath = `static/ImagesCarousel/${newFilename}`;
            await githubApiCall(imagePath, 'PUT', cleanBase64, `Upload image ${newFilename} via Admin`);
            
            // 2. Update gallery.json
            const { sha, currentGallery } = await getGalleryJson();
            currentGallery.push(newFilename);
            const newJsonContent = btoa(JSON.stringify(currentGallery, null, 2));
            
            await githubApiCall('static/gallery.json', 'PUT', newJsonContent, `Update gallery.json with ${newFilename}`, sha);
            
            showAlert('success', `Success! Image uploaded. It will appear on the live site in ~1 minute.`);
            uploadForm.reset();
            loadGallery();

        } catch (error) {
            console.error(error);
            showAlert('danger', `Upload Error: ${error.message}. Check your PAT token.`);
            if (error.message.includes('401')) logoutBtn.click(); // Auto logout on auth error
        } finally {
            uploadBtn.innerHTML = originalBtnText;
            uploadBtn.disabled = false;
        }
    });

    // --- Delete Logic ---
    async function deleteImage(filename) {
        if (!confirm(`Are you sure you want to delete ${filename}? This will remove it from the live site.`)) return;

        try {
            // Find file SHA first (required to delete a file via GitHub API)
            const fileResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/static/ImagesCarousel/${filename}`, {
                headers: { 'Authorization': `token ${currentPat}` }
            });
            if (!fileResp.ok) throw new Error("Could not find file on GitHub");
            const fileData = await fileResp.json();
            const fileSha = fileData.sha;

            // 1. Delete image file
            await githubApiCall(`static/ImagesCarousel/${filename}`, 'DELETE', null, `Delete image ${filename}`, fileSha);

            // 2. Update gallery.json
            const { sha, currentGallery } = await getGalleryJson();
            const updatedGallery = currentGallery.filter(name => name !== filename);
            const newJsonContent = btoa(JSON.stringify(updatedGallery, null, 2));
            
            await githubApiCall('static/gallery.json', 'PUT', newJsonContent, `Remove ${filename} from gallery.json`, sha);

            showAlert('success', `Image deleted successfully.`);
            loadGallery();

        } catch (error) {
            console.error(error);
            showAlert('danger', `Delete Error: ${error.message}`);
        }
    }

    // --- Helpers ---
    async function getGalleryJson() {
        const jsonPath = 'static/gallery.json';
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`, {
            headers: { 'Authorization': `token ${currentPat}` },
            cache: 'no-store' // prevent stale data
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                // If file doesn't exist yet, return empty
                return { sha: null, currentGallery: [] };
            }
            throw new Error(`Failed to fetch gallery.json (${response.status})`);
        }

        const data = await response.json();
        const decodedJson = atob(data.content);
        let currentGallery = [];
        try {
            currentGallery = JSON.parse(decodedJson);
        } catch(e) {}
        
        return { sha: data.sha, currentGallery };
    }

    async function githubApiCall(path, method, content, message, sha = null) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const body = { message };
        if (content) body.content = content;
        if (sha) body.sha = sha;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `token ${currentPat}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'GitHub API error');
        }
        return await response.json();
    }

    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function showAlert(type, message) {
        alertBox.className = `alert alert-${type} mb-4`;
        alertBox.innerHTML = message;
        alertBox.classList.remove('d-none');
    }

    function hideAlert() {
        alertBox.classList.add('d-none');
    }
});
