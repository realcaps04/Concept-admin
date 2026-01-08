# Dashboard Updates - Implementation Code

## JavaScript Functions to Add

Add these functions to the `<script>` section in users-dashboard.html (before the closing `</script>` tag):

```javascript
// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('hidden');
    
    // Adjust main content margin when sidebar is hidden
    if (sidebar.classList.contains('hidden')) {
        mainContent.style.marginLeft = '0';
    } else {
        mainContent.style.marginLeft = 'var(--sidebar-width)';
    }
}

// Open New Project Modal
function openNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'flex';
}

// Close New Project Modal
function closeNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'none';
    document.getElementById('newProjectForm').reset();
}

// Handle New Project Submission
document.addEventListener('DOMContentLoaded', () => {
    const newProjectForm = document.getElementById('newProjectForm');
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentUserEmail) {
                showNotification('Error', 'Please log in to submit a project request', 'error');
                return;
            }
            
            try {
                const projectData = {
                    user_email: currentUserEmail,
                    project_name: document.getElementById('projectName').value.trim(),
                    project_type: document.getElementById('projectType').value,
                    budget: document.getElementById('projectBudget').value ? parseFloat(document.getElementById('projectBudget').value) : null,
                    deadline: document.getElementById('projectDeadline').value || null,
                    priority: document.getElementById('projectPriority').value,
                    description: document.getElementById('projectDescription').value.trim(),
                    status: 'Pending',
                    created_at: new Date().toISOString()
                };
                
                const { error } = await sbClient
                    .from('project_requests')
                    .insert([projectData]);
                
                if (error) throw error;
                
                showNotification('Success', 'Project request submitted successfully!', 'success');
                closeNewProjectModal();
                
                // Reload projects if on projects section
                const projectsSection = document.getElementById('projects-section');
                if (projectsSection && projectsSection.style.display !== 'none') {
                    loadProjects();
                }
            } catch (err) {
                console.error('Error submitting project:', err);
                showNotification('Error', 'Failed to submit project request: ' + err.message, 'error');
            }
        });
    }
});
```

## HTML Modal to Add

Add this HTML after the notification modal (around line 1849):

```html
<!-- New Project Request Modal -->
<div id="newProjectModal" class="maintenance-overlay" style="display: none;">
    <div class="maintenance-modal" style="max-width: 900px; width: 90%; max-height: 85vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; position: sticky; top: 0; background: var(--white); padding-bottom: 16px; border-bottom: 1px solid var(--border-light); z-index: 10;">
            <h2 style="color: var(--text-main); margin: 0; font-size: 1.5rem; font-weight: 700;">Request New Project</h2>
            <button onclick="closeNewProjectModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <form id="newProjectForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Project Name -->
            <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Name *</label>
                <input type="text" id="projectName" required placeholder="Enter project name" style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem;">
            </div>
            
            <!-- Project Type -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Type *</label>
                <select id="projectType" required style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; cursor: pointer;">
                    <option value="">Select Type</option>
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Web App">Web App</option>
                    <option value="Desktop App">Desktop App</option>
                    <option value="API Development">API Development</option>
                    <option value="Database Design">Database Design</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <!-- Budget -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Budget (₹)</label>
                <input type="number" id="projectBudget" placeholder="Enter budget" style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem;">
            </div>
            
            <!-- Deadline -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Deadline</label>
                <input type="date" id="projectDeadline" style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem;">
            </div>
            
            <!-- Priority -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Priority *</label>
                <select id="projectPriority" required style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; cursor: pointer;">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>
            
            <!-- Description -->
            <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Description *</label>
                <textarea id="projectDescription" rows="5" required placeholder="Describe your project requirements..." style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; resize: vertical; line-height: 1.6;"></textarea>
            </div>
            
            <!-- Submit Button -->
            <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);">
                <button type="button" onclick="closeNewProjectModal()" style="padding: 12px 24px; background: transparent; border: 1px solid var(--border-light); border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-main);">Cancel</button>
                <button type="submit" style="padding: 12px 32px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Submit Request
                </button>
            </div>
        </form>
    </div>
</div>
```

## Update "Request New Project" Button

Find the button in the projects section and update its onclick:

```html
<!-- OLD -->
<button onclick="window.location.href='Project-work-request.html'">

<!-- NEW -->
<button onclick="openNewProjectModal()">
```

## Summary of Changes Made

✅ **Sidebar Toggle**:
- Added toggle button in header (hamburger menu icon)
- Added CSS transition for smooth hide/show
- Added `.sidebar.hidden` class for hidden state
- Added `toggleSidebar()` JavaScript function

✅ **New Project Modal**:
- Created modal HTML with form fields
- Added `openNewProjectModal()` function
- Added `closeNewProjectModal()` function
- Added form submission handler with Supabase integration

✅ **Database**:
- Created `create_project_requests_table.sql` schema

✅ **Files Created**:
- `consoleuser.html` - New login/signup page
- `create_project_requests_table.sql` - Database schema
- `DASHBOARD_UPDATES_CODE.md` - This implementation guide

## Next Manual Steps

1. Copy the modal HTML and paste it after line 1849 in users-dashboard.html
2. Copy the JavaScript functions and add them to the script section
3. Update the "Request New Project" button onclick
4. Run the SQL schema in Supabase
5. Delete Project-work-request.html (optional)
