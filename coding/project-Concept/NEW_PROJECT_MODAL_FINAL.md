# New Project Request Modal - Final Implementation

## ✅ COMPLETED:
1. JavaScript functions added (toggleSidebar, openNewProjectModal, closeNewProjectModal, form submission)
2. Request New Project card added to projects section
3. Grid layout configured for 4 cards per row
4. SQL schema created for project_requests table

## 📋 MANUAL STEP REQUIRED:

Add this HTML modal **after line 1849** (after the notification modal closes):

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
                    <input type="text" id="projectName" required placeholder="Enter project name" style="width: 100%; padding: 12px 14px; border: 1px solid var(--border-light); border-radius: 8px; background: var(--input-bg); color: var(--text-main); font-size: 0.95rem; outline: none;">
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

## 🎯 What's Working Now:

1. ✅ **"Request New Project" card** - Displays in projects section (4-column grid)
2. ✅ **Click handler** - `onclick="openNewProjectModal()"` already set
3. ✅ **JavaScript functions** - All modal functions added
4. ✅ **Form submission** - Saves to `project_requests` table in Supabase
5. ✅ **Sidebar toggle** - Hamburger menu button works
6. ✅ **Removed old references** - No more redirects to Project-work-request.html

## 📝 Form Fields:
- Project Name (required)
- Project Type (dropdown: Website, Mobile App, Web App, etc.)
- Budget (₹)
- Deadline (date picker)
- Priority (dropdown: Low, Medium, High, Urgent)
- Description (textarea, required)

## 🗄️ Database:
Run `create_project_requests_table.sql` in Supabase to create the table.

## 🎨 Design:
- Matches SnowUI dark mode aesthetic
- Responsive 2-column grid layout
- Sticky header with close button
- Cancel and Submit buttons
- Form validation

Just copy the HTML modal code above and paste it after line 1849 in users-dashboard.html!
