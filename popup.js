// Popup interface handler
document.addEventListener('DOMContentLoaded', function() {
    const sourcesDiv = document.getElementById('sources');
    const statusDiv = document.getElementById('status');
    const clearBtn = document.getElementById('clearBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    
    // Function to create source item element
    function createSourceItem(source) {
        const div = document.createElement('div');
        div.className = 'source-item';
        
        const type = document.createElement('div');
        type.className = 'source-type';
        type.textContent = `Type: ${source.type}`;
        
        const url = document.createElement('div');
        url.className = 'source-url';
        url.textContent = source.url;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy URL';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(source.url);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy URL';
            }, 2000);
        };
        
        div.appendChild(type);
        div.appendChild(url);
        div.appendChild(copyBtn);
        
        return div;
    }
    
    // Function to update sources display
    function updateSourcesDisplay(sources) {
        sourcesDiv.innerHTML = '';
        if (sources && sources.length > 0) {
            statusDiv.textContent = `Found ${sources.length} video source(s)`;
            sources.forEach(source => {
                sourcesDiv.appendChild(createSourceItem(source));
            });
        } else {
            statusDiv.textContent = 'No video sources found on this page';
        }
    }
    
    // Function to trigger scanning
    function triggerScanning() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            // Execute content script
            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                files: ['content.js']
            });
            
            // Clear previous sources
            chrome.storage.local.remove(['lastVideoSource']);
            
            // Show scanning status
            statusDiv.textContent = 'Scanning for video sources...';
            statusDiv.classList.add('scanning');
            
            // Re-enable reload button after 2 seconds
            setTimeout(() => {
                reloadBtn.disabled = false;
                statusDiv.classList.remove('scanning');
                
                // Get updated sources
                chrome.storage.local.get(['lastVideoSource'], function(result) {
                    updateSourcesDisplay(result.lastVideoSource);
                });
            }, 2000);
        });
    }
    
    // Clear button handler
    clearBtn.addEventListener('click', function() {
        chrome.storage.local.remove(['lastVideoSource'], function() {
            updateSourcesDisplay([]);
            statusDiv.textContent = 'Data cleared. Click "Reload & Scan" to find new sources.';
        });
    });
    
    // Reload button handler
    reloadBtn.addEventListener('click', function() {
        // Disable reload button
        reloadBtn.disabled = true;
        
        // Trigger scanning
        triggerScanning();
    });
    
    // Initial scan
    triggerScanning();
}); 