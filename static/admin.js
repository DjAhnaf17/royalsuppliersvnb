document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('upload-form');
    const btn = document.getElementById('upload-btn');
    const alertBox = document.getElementById('alert-box');
    
    // GitHub Repo Configuration
    const owner = 'DjAhnaf17';
    const repo = 'royalsuppliersvnb';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pat = document.getElementById('pat-token').value.trim();
        const fileInput = document.getElementById('gallery-image');
        const file = fileInput.files[0];
        
        if (!pat || !file) return;

        // UI Loading State
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Uploading...';
        btn.disabled = true;
        hideAlert();

        try {
            // 1. Read file as Base64
            const base64Content = await getBase64(file);
            const cleanBase64 = base64Content.split(',')[1]; // Remove data:image/jpeg;base64,
            
            // Format filename to avoid spaces and special chars
            const timestamp = new Date().getTime();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const newFilename = `${timestamp}_${safeName}`;
            
            // 2. Upload Image to GitHub
            const imagePath = `static/ImagesCarousel/${newFilename}`;
            await uploadToGitHub(pat, imagePath, cleanBase64, `Upload image ${newFilename} via Admin`);
            
            // 3. Get current gallery.json SHA (needed to update it)
            const jsonPath = 'static/gallery.json';
            const jsonFileResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}`, {
                headers: { 'Authorization': `token ${pat}` }
            });
            
            let sha = null;
            let currentGallery = [];
            
            if (jsonFileResp.ok) {
                const jsonData = await jsonFileResp.json();
                sha = jsonData.sha;
                const decodedJson = atob(jsonData.content);
                try {
                    currentGallery = JSON.parse(decodedJson);
                } catch(e) {
                    currentGallery = [];
                }
            }
            
            // 4. Update gallery.json content
            currentGallery.push(newFilename);
            const newJsonContent = btoa(JSON.stringify(currentGallery, null, 2));
            
            // 5. Commit updated gallery.json
            await uploadToGitHub(pat, jsonPath, newJsonContent, `Update gallery.json with ${newFilename}`, sha);
            
            showAlert('success', `Success! Image uploaded. It may take 1-2 minutes to appear on the live site.`);
            form.reset();

        } catch (error) {
            console.error(error);
            showAlert('danger', `Error: ${error.message}`);
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });

    // Helper: Convert File to Base64
    function getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Helper: GitHub API PUT Request
    async function uploadToGitHub(token, path, content, message, sha = null) {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const body = {
            message: message,
            content: content
        };
        
        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
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

    // Helper: Show Alert
    function showAlert(type, message) {
        alertBox.className = `alert alert-${type}`;
        alertBox.innerHTML = message;
        alertBox.classList.remove('d-none');
    }

    function hideAlert() {
        alertBox.classList.add('d-none');
    }
});
