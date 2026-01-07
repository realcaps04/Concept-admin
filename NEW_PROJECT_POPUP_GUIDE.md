# New Project Request Popup Implementation Guide

## Summary

This guide explains the changes made to implement a new project request popup in the dashboard and the creation of `consoleuser.html`.

## Files Created/Modified

### 1. **consoleuser.html** ✅ CREATED
- **Purpose**: Standalone login and signup page for Console Projects users
- **Features**:
  - Dark theme matching SnowUI aesthetic
  - Tab-based interface (Login / Sign Up)
  - Supabase integration for authentication
  - Form validation
  - Auto-redirect to dashboard after successful login/signup
  
**Fields**:
- **Login**: Email, Password
- **Signup**: First Name, Middle Name, Last Name, Email, Phone, Password, Confirm Password

### 2. **Project-work-request.html** - TO BE DELETED
- This file is no longer needed after implementing the popup
- All functionality moved to dashboard popup

### 3. **users-dashboard.html** - TO BE MODIFIED
Need to add:
- New project request popup modal
- Form fields for project submission
- Integration with Supabase `project_requests` table

## Next Steps

### Step 1: Add Project Request Popup to Dashboard

Add this modal HTML before the closing `</body>` tag in `users-dashboard.html`:

```html
<!-- New Project Request Modal -->
<div id="newProjectModal" class="maintenance-overlay" style="display: none;">
    <div class="maintenance-modal" style="max-width: 900px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="color: var(--text-main); margin: 0;">Request New Project</h2>
            <button onclick="closeNewProjectModal()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <form id="newProjectForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-height: 60vh; overflow-y: auto; padding-right: 10px;">
            <!-- Project Name -->
            <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Name</label>
                <input type="text" id="projectName" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main);">
            </div>
            
            <!-- Project Type -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Type</label>
                <select id="projectType" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main);">
                    <option value="">Select Type</option>
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Web App">Web App</option>
                    <option value="Desktop App">Desktop App</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            
            <!-- Budget -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Budget (₹)</label>
                <input type="number" id="projectBudget" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main);">
            </div>
            
            <!-- Deadline -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Deadline</label>
                <input type="date" id="projectDeadline" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main);">
            </div>
            
            <!-- Priority -->
            <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Priority</label>
                <select id="projectPriority" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main);">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>
            
            <!-- Description -->
            <div style="grid-column: span 2;">
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Project Description</label>
                <textarea id="projectDescription" rows="4" required style="width: 100%; padding: 12px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); resize: vertical;"></textarea>
            </div>
            
            <!-- Submit Button -->
            <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button type="button" onclick="closeNewProjectModal()" style="padding: 12px 24px; background: transparent; border: 1px solid var(--border-light); border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-main);">Cancel</button>
                <button type="submit" style="padding: 12px 32px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-paper-plane" style="margin-right: 8px;"></i>Submit Request
                </button>
            </div>
        </form>
    </div>
</div>
```

### Step 2: Add JavaScript Functions

Add these functions to the `<script>` section:

```javascript
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
document.getElementById('newProjectForm').addEventListener('submit', async (e) => {
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
            budget: parseFloat(document.getElementById('projectBudget').value),
            deadline: document.getElementById('projectDeadline').value,
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
        if (document.getElementById('projects-section').style.display !== 'none') {
            loadProjects();
        }
    } catch (err) {
        console.error('Error submitting project:', err);
        showNotification('Error', 'Failed to submit project request: ' + err.message, 'error');
    }
});
```

### Step 3: Update "Request New Project" Button

Find the "Request New Project" button in the projects section and update its onclick:

```html
<button onclick="openNewProjectModal()" style="...">
    <i class="fas fa-plus"></i> Request New Project
</button>
```

### Step 4: Update Login/Signup Modal Links

Replace all references to `Project-work-request.html` with `consoleuser.html`:

```html
<!-- Old -->
<a href="Project-work-request.html">...</a>

<!-- New -->
<a href="consoleuser.html">...</a>
```

## Database Schema Required

Ensure the `project_requests` table exists in Supabase with these columns:
- id (UUID, PRIMARY KEY)
- user_email (TEXT)
- project_name (TEXT)
- project_type (TEXT)
- budget (NUMERIC)
- deadline (DATE)
- priority (TEXT)
- description (TEXT)
- status (TEXT, DEFAULT: 'Pending')
- created_at (TIMESTAMP)

## Benefits of This Approach

✅ **Better UX**: Users stay in the dashboard instead of navigating away
✅ **Faster**: No page reload required
✅ **Consistent**: Matches SnowUI dark mode aesthetic
✅ **Cleaner**: Removes unnecessary file (Project-work-request.html)
✅ **Organized**: Separate authentication page (consoleuser.html)

## Files to Delete

After implementation is complete:
- ❌ `Project-work-request.html` - No longer needed
